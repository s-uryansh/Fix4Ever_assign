const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vendor = require("../models/Vendor");
const Booking = require("../models/Booking");
const User = require("../models/User");

let genAI;
let geminiProModel;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiProModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  } else {
    console.warn("GEMINI_API_KEY not found. AI features will use fallback responses.");
  }
} catch (error) {
  console.error("Error initializing Gemini AI:", error);
}

class AIController {
  
  async diagnoseIssue(req, res) {
    try {
      const { description, imageData } = req.body;
      
      if (!description && !imageData) {
        return res.status(400).json({ 
          success: false,
          message: "Either description or image data is required" 
        });
      }

      let diagnosis;
      if (imageData) {
        diagnosis = await this.analyzeImage(description, imageData);
      } else {
        diagnosis = await this.analyzeDescription(description);
      }

      const matchingVendors = await this.findMatchingVendors(diagnosis);
      
      res.json({
        success: true,
        diagnosis,
        suggestedServices: diagnosis.suggestedServices,
        estimatedCost: diagnosis.estimatedCostRange,
        matchingVendors: matchingVendors.slice(0, 5)
      });
    } catch (error) {
      console.error("AI diagnosis error:", error);
      res.status(500).json({ 
        success: false,
        message: "Can't reach AI right now. Please try again later." 
      });
    }
  }

  async analyzeDescription(description) {
    console.log(description)
    if (!geminiProModel) {
      return this.getFallbackAnalysis(description);
    }

    try {
      const prompt = `
        As an expert multi-domain repair technician, analyze this issue description and provide structured analysis:

        ISSUE DESCRIPTION: "${description}"

        Provide analysis in this exact JSON format only:
        {
          "diagnosis": "detailed problem diagnosis",
          "requiredSkills": ["skill1", "skill2", "skill3"],
          "estimatedTime": "1-2 hours",
          "estimatedCostRange": {"min": 50, "max": 200},
          "urgency": "medium",
          "suggestedServices": ["Service1", "Service2"],
          "requiredTools": ["tool1", "tool2"],
          "complexity": "low/medium/high"
        }

        Consider all repair domains: electronics, appliances, plumbing, electrical, home repairs, carpentry, etc.
        Be realistic about costs and time estimates.
      `;

      const result = await geminiProModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from AI");
      }
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return this.getFallbackAnalysis(description);
    }
  }

  async analyzeImage(description, imageData) {
    console.log("Image analysis requested - using text analysis");
    return await this.analyzeDescription(description);
  }

  async suggestTechnician(req, res) {
    try {
      const { issueDescription, userLocation, preferredSkills } = req.body;
      
      if (!issueDescription) {
        return res.status(400).json({
          success: false,
          message: "Issue description is required"
        });
      }

      const diagnosis = await this.analyzeDescription(issueDescription);
      
      const matchingVendors = await this.findMatchingVendorsWithTechnicians(diagnosis, userLocation);
      
      const suggestedTechnicians = this.rankTechnicians(matchingVendors, diagnosis, preferredSkills);

      res.json({
        success: true,
        suggestedTechnicians: suggestedTechnicians.slice(0, 5),
        diagnosis: {
          requiredSkills: diagnosis.requiredSkills,
          complexity: diagnosis.complexity,
          estimatedTime: diagnosis.estimatedTime
    // Default cost ranges based on service type
        }
      });
    } catch (error) {
      console.error("Suggest technician error:", error);
      res.status(500).json({
        success: false,
        message: "Can't reach AI right now. Please try again later."
      });
    }
  }

  async findMatchingVendors(diagnosis) {
    try {
      return await Vendor.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { "servicesOffered.name": { $in: diagnosis.suggestedServices } },
              { "technicians.skills": { $in: diagnosis.requiredSkills } }
            ]
          }
        },
        {
          $addFields: {
            skillMatchScore: {
              $size: {
                $setIntersection: ["$technicians.skills", diagnosis.requiredSkills]
              }
            },
            serviceMatchScore: {
              $size: {
                $setIntersection: ["$servicesOffered.name", diagnosis.suggestedServices]
              }
            },
            totalScore: {
              $add: [
                {
                  $size: {
                    $setIntersection: ["$technicians.skills", diagnosis.requiredSkills]
                  }
                },
                {
                  $size: {
                    $setIntersection: ["$servicesOffered.name", diagnosis.suggestedServices]
                  }
                },
                "$rating"
              ]
            }
          }
        },
        { $sort: { totalScore: -1 } },
        { $limit: 10 },
        {
          $project: {
            businessName: 1,
            address: 1,
            contactPhone: 1,
            rating: 1,
            skillMatchScore: 1,
            serviceMatchScore: 1,
            totalScore: 1,
            "servicesOffered.name": 1,
            "technicians.name": 1,
            "technicians.skills": 1
          }
        }
      ]);
    } catch (error) {
      console.error("Vendor matching error:", error);
      return [];
    }
  }

  async findMatchingVendorsWithTechnicians(diagnosis, userLocation) {
    try {
      return await Vendor.aggregate([
        {
          $match: {
            isActive: true,
            "technicians.available": true,
            $or: [
              { "servicesOffered.name": { $in: diagnosis.suggestedServices } },
              { "technicians.skills": { $in: diagnosis.requiredSkills } }
            ]
          }
        },
        {
          $unwind: "$technicians"
        },
        {
          $match: {
            "technicians.available": true,
            "technicians.skills": { $in: diagnosis.requiredSkills }
          }
        },
        {
          $group: {
            _id: "$_id",
            businessName: { $first: "$businessName" },
            address: { $first: "$address" },
            rating: { $first: "$rating" },
            contactPhone: { $first: "$contactPhone" },
            technicians: { $push: "$technicians" }
          }
        },
        { $limit: 10 }
      ]);
    } catch (error) {
      console.error("Vendor with technicians matching error:", error);
      return [];
    }
  }

  rankTechnicians(vendors, diagnosis, preferredSkills = []) {
    const allTechnicians = [];
    
    vendors.forEach(vendor => {
      vendor.technicians.forEach(tech => {
        const skillMatch = tech.skills.filter(skill => 
          diagnosis.requiredSkills.includes(skill)
        ).length;
        
        const preferredSkillBonus = tech.skills.filter(skill =>
          preferredSkills.includes(skill)
        ).length;
        
        const score = (skillMatch * 10) + (preferredSkillBonus * 5) + vendor.rating;
        
        allTechnicians.push({
          technician: tech,
          vendor: {
            _id: vendor._id,
            businessName: vendor.businessName,
            address: vendor.address,
            contactPhone: vendor.contactPhone,
            rating: vendor.rating
          },
          matchScore: score,
          skillMatchCount: skillMatch
        });
      });
    });

    return allTechnicians.sort((a, b) => b.matchScore - a.matchScore);
  }

  async chatSupport(req, res) {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      if (!geminiProModel) {
        return res.json({
          success: true,
          response: "I understand you need repair services. Fix4Ever handles all types of repairs including electronics, appliances, plumbing, electrical, and home repairs. Would you like me to help you find a technician for your specific issue?",
          conversationId: req.body.conversationId || `conv_${Date.now()}`,
          timestamp: new Date().toISOString(),
          note: "AI service temporarily unavailable"
        });
      }

      const context = `
        You are a helpful customer support agent for "Fix4Ever" - a comprehensive repair service marketplace that fixes everything.

        Services we offer:
        - Electronics repair (phones, laptops, TVs, gadgets)
        - Home appliance repair (refrigerators, washing machines, ACs, microwaves)
        - Plumbing services (leaks, pipe repairs, installations)
        - Electrical work (wiring, socket repairs, electrical safety)
        - Carpentry and furniture repair
        - Home maintenance and general repairs
        - Automotive repairs (basic maintenance)
        
        Your role:
        1. Be friendly, professional, and empathetic
        2. Help users diagnose common issues across all repair domains
        3. Guide them to book appropriate technicians
        4. Provide general troubleshooting tips when safe to do so
        5. For emergencies, suggest immediate booking
        6. Always recommend professional help for complex or dangerous issues
        
        Company info:
        - 24/7 support available for emergencies
        - Certified technicians across all domains
        - 90-day service warranty on all repairs
        - Transparent pricing with no hidden costs
        
        Current conversation history: ${JSON.stringify(conversationHistory)}
        
        User's current message: "${message}"
        
        Provide a helpful, concise response that addresses their repair needs.
      `;

      const result = await geminiProModel.generateContent(context);
      const response = await result.response;
      
      res.json({
        success: true,
        response: response.text(),
        conversationId: req.body.conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat support error:", error);
      
      const fallbackResponses = {
        "screen": "For screen replacement, it typically takes 1-2 hours and costs vary by device. Our technicians can handle phone, laptop, and TV screens.",
        "battery": "Battery replacement service is available. Time and cost depend on the device type.",
        "leak": "For plumbing leaks, we recommend immediate attention. Our plumbers can assess and fix the issue quickly.",
        "electr": "Electrical issues should be handled by certified electricians for safety. We can connect you with one.",
        "plumb": "Our plumbers handle pipe repairs, leaks, installations, and other plumbing issues.",
        "appliance": "We repair all major appliances - refrigerators, washing machines, ACs, microwaves, and more.",
        "furniture": "Carpentry and furniture repair services are available for home and office furniture.",
        "car": "We offer basic automotive maintenance and repair services.",
        "default": "I understand you need repair services. Fix4Ever handles all types of repairs. Could you provide more details about your issue so I can connect you with the right technician?"
      };

      let fallbackResponse = fallbackResponses.default;
      const messageLower = message.toLowerCase();
      
      if (messageLower.includes("screen")) fallbackResponse = fallbackResponses.screen;
      else if (messageLower.includes("batter")) fallbackResponse = fallbackResponses.battery;
      else if (messageLower.includes("leak")) fallbackResponse = fallbackResponses.leak;
      else if (messageLower.includes("electric")) fallbackResponse = fallbackResponses.electr;
      else if (messageLower.includes("plumb")) fallbackResponse = fallbackResponses.plumb;
      else if (messageLower.includes("appliance")) fallbackResponse = fallbackResponses.appliance;
      else if (messageLower.includes("furniture") || messageLower.includes("carpent")) fallbackResponse = fallbackResponses.furniture;
      else if (messageLower.includes("car") || messageLower.includes("vehicle")) fallbackResponse = fallbackResponses.car;

      res.json({
        success: true,
        response: fallbackResponse,
        conversationId: req.body.conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        note: "Can't reach AI right now. Using fallback response."
      });
    }
  }

  async generateInvoice(req, res) {
    try {
      const { bookingId } = req.params;
      
      const booking = await Booking.findById(bookingId)
        .populate("userId", "name email phone")
        .populate("vendorId", "businessName gstNumber address contactEmail contactPhone");

      if (!booking) {
        return res.status(404).json({ 
          success: false,
          message: "Booking not found" 
        });
      }

      if (booking.userId._id.toString() !== req.user._id.toString() && 
          booking.vendorId.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      if (!geminiProModel) {
        const basicInvoice = this.generateBasicInvoice(booking);
        return res.json({
          success: true,
          html: basicInvoice,
          bookingId: booking._id,
          invoiceNumber: `INV-${bookingId.toString().slice(-6).toUpperCase()}`,
          generatedAt: new Date().toISOString(),
          customer: {
            name: booking.userId.name,
            email: booking.userId.email
          },
          vendor: {
            name: booking.vendorId.businessName,
            gst: booking.vendorId.gstNumber
          },
          amount: booking.price,
          note: "Basic invoice generated (AI unavailable)"
        });
      }

      const invoicePrompt = `
        Generate a professional invoice HTML template for repair services with the following details:
        
        INVOICE DETAILS:
        - Customer Name: ${booking.userId.name}
        - Customer Email: ${booking.userId.email}
        - Customer Phone: ${booking.userId.phone}
        - Service Provided: Repair Service
        - Total Amount: ₹${booking.price}
        - Business Name: ${booking.vendorId.businessName}
        - Business GST: ${booking.vendorId.gstNumber || 'Not Provided'}
        - Business Address: ${booking.vendorId.address}
        - Business Contact: ${booking.vendorId.contactPhone}
        - Invoice Date: ${new Date().toLocaleDateString()}
        - Invoice Number: INV-${bookingId.toString().slice(-6).toUpperCase()}
        
        Requirements:
        - Professional, clean design
        - Include company logo placeholder
        - Itemized service breakdown
        - GST calculation if GST number provided
        - Payment terms: Due on receipt
        - Thank you message
        - Make it printer-friendly
        - Use inline CSS for email compatibility
        
        Generate only the HTML content without any markdown formatting.
      `;

      const result = await geminiProModel.generateContent(invoicePrompt);
      const response = await result.response;

      res.json({
        success: true,
        html: response.text(),
        bookingId: booking._id,
        invoiceNumber: `INV-${bookingId.toString().slice(-6).toUpperCase()}`,
        generatedAt: new Date().toISOString(),
        customer: {
          name: booking.userId.name,
          email: booking.userId.email
        },
        vendor: {
          name: booking.vendorId.businessName,
          gst: booking.vendorId.gstNumber
        },
        amount: booking.price
      });
    } catch (error) {
      console.error("Invoice generation error:", error);
      
      const booking = await Booking.findById(req.params.bookingId)
        .populate("userId", "name email phone")
        .populate("vendorId", "businessName gstNumber address contactEmail contactPhone");

      if (booking) {
        const basicInvoice = this.generateBasicInvoice(booking);
        return res.json({
          success: true,
          html: basicInvoice,
          bookingId: booking._id,
          invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,
          generatedAt: new Date().toISOString(),
          customer: {
            name: booking.userId.name,
            email: booking.userId.email
          },
          vendor: {
            name: booking.vendorId.businessName,
            gst: booking.vendorId.gstNumber
          },
          amount: booking.price,
          note: "Basic invoice generated - Can't reach AI right now"
        });
      }

      res.status(500).json({ 
        success: false,
        message: "Can't reach AI right now. Please try again later." 
      });
    }
  }

  generateBasicInvoice(booking) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .invoice { border: 1px solid #ddd; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>INVOICE</h1>
            <p>Fix4Ever - We Fix Everything</p>
          </div>
          <div class="details">
            <div>
              <h3>Bill To:</h3>
              <p>${booking.userId.name}</p>
              <p>${booking.userId.email}</p>
              <p>${booking.userId.phone}</p>
            </div>
            <div>
              <p><strong>Invoice #:</strong> INV-${booking._id.toString().slice(-6).toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Repair Service</td>
                <td>₹${booking.price}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total: ₹${booking.price}
          </div>
          <div class="footer">
            <p>Thank you for choosing Fix4Ever!</p>
            <p>Payment Terms: Due on Receipt</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getFallbackAnalysis(description) {
    const keywords = {
      "phone": ["Phone Repair", "Screen Replacement", "Battery Replacement"],
      "laptop": ["Laptop Repair", "Hardware Repair", "Software Installation"],
      "computer": ["Computer Repair", "Hardware Upgrade", "Virus Removal"],
      "tv": ["TV Repair", "Screen Replacement", "Circuit Repair"],
      "tablet": ["Tablet Repair", "Screen Replacement"],
      
      "refrigerator": ["Refrigerator Repair", "Cooling System", "Compressor"],
      "washing": ["Washing Machine Repair", "Motor Repair", "Drum Replacement"],
      "ac": ["AC Repair", "Gas Charging", "Compressor Repair"],
      "microwave": ["Microwave Repair", "Magnetron Replacement"],
      "oven": ["Oven Repair", "Heating Element", "Thermostat"],
      
      "leak": ["Leak Repair", "Pipe Replacement", "Sealant Application"],
      "pipe": ["Pipe Repair", "Pipe Replacement", "Joint Fixing"],
      "tap": ["Tap Repair", "Washer Replacement", "Cartridge Replacement"],
      "toilet": ["Toilet Repair", "Flush System", "Seal Replacement"],
      "drain": ["Drain Cleaning", "Blockage Removal", "Pipe Inspection"],
      
      "wiring": ["Electrical Wiring", "Circuit Repair", "Safety Check"],
      "socket": ["Socket Repair", "Wiring Check", "Replacement"],
      "switch": ["Switch Repair", "Wiring Check", "Replacement"],
      "fuse": ["Fuse Replacement", "Electrical Safety", "Circuit Check"],
      
      "furniture": ["Furniture Repair", "Woodwork", "Polish & Finish"],
      "door": ["Door Repair", "Hinge Replacement", "Lock Installation"],
      "window": ["Window Repair", "Glass Replacement", "Frame Repair"],
      "carpent": ["Carpentry Work", "Wood Repair", "Custom Work"],
      
      "car": ["Car Maintenance", "Basic Repair", "Service"],
      "vehicle": ["Vehicle Repair", "Maintenance", "Service"]
    };

    const foundServices = [];
    const foundSkills = ["Diagnostics", "Basic Repair"];

    for (const [key, services] of Object.entries(keywords)) {
      if (description.toLowerCase().includes(key)) {
        foundServices.push(...services);
        foundSkills.push(...services);
      }
    }

    let costRange = { min: 200, max: 1000 };
    if (description.toLowerCase().includes("screen")) costRange = { min: 1000, max: 8000 };
    if (description.toLowerCase().includes("battery")) costRange = { min: 500, max: 4000 };
    if (description.toLowerCase().includes("refrigerator") || description.toLowerCase().includes("ac")) costRange = { min: 500, max: 3000 };
    if (description.toLowerCase().includes("plumb") || description.toLowerCase().includes("leak")) costRange = { min: 300, max: 2000 };
    if (description.toLowerCase().includes("electric")) costRange = { min: 200, max: 1500 };
    if (description.toLowerCase().includes("car")) costRange = { min: 500, max: 5000 };

    return {
      diagnosis: "Based on your description, this appears to be a repair issue that our technicians can handle. Fix4Ever provides comprehensive repair services across all domains.",
      requiredSkills: foundSkills.length > 0 ? foundSkills : ["General Repair", "Diagnostics"],
      estimatedTime: "1-4 hours",
      estimatedCostRange: costRange,
      urgency: "medium",
      suggestedServices: foundServices.length > 0 ? foundServices : ["General Repair Service"],
      requiredTools: ["Professional Toolkit", "Testing Equipment", "Safety Gear"],
      complexity: "medium"
    };
  }
}

module.exports = new AIController();