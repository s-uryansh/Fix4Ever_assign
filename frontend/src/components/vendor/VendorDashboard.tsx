'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  FaPlus as AddIcon,
  FaEdit as EditIcon,
  FaTrash as DeleteIcon,
  FaUser as PersonIcon,
  FaTools as BuildIcon,
  FaBuilding as BusinessIcon,
  FaStar as StarIcon,
} from 'react-icons/fa';
import { vendorAPI } from '@/utils/api';
import { Vendor, Service, Technician, ServiceFormData, TechnicianFormData } from '@/types/index';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vendor-tabpanel-${index}`}
      aria-labelledby={`vendor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Service Management
  const [services, setServices] = useState<Service[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    estimatedDuration: ''
  });

  // Technician Management
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techDialogOpen, setTechDialogOpen] = useState<boolean>(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [techForm, setTechForm] = useState<TechnicianFormData>({
    name: '',
    skills: '',
    phone: '',
    experience: '',
    available: true
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async (): Promise<void> => {
    try {
      setLoading(true);
      const vendorResponse = await vendorAPI.getMyVendor();
      const vendorData = vendorResponse.data.vendor;
      setVendor(vendorData);
      setServices(vendorData.servicesOffered || []);
      setTechnicians(vendorData.technicians || []);
    } catch (err: any) {
      console.error('Error fetching vendor data:', err);
      if (err.response?.status === 404) {
        setError('Vendor profile not found. Please complete your vendor registration first.');
      } else {
        setError('Failed to load vendor data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Service Management Functions
  const handleServiceSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (!vendor) return;

      // send strings matching ServiceFormData type
      if (editingService) {
        await vendorAPI.updateService(editingService._id, serviceForm);
        setSuccess('Service updated successfully');
      } else {
        await vendorAPI.addService(vendor._id, serviceForm);
        setSuccess('Service added successfully');
      }
      setServiceDialogOpen(false);
      resetServiceForm();
      await fetchVendorData();
    } catch (err: any) {
      setError('Failed to save service');
      console.error('Error saving service:', err);
    }
  };

  const handleEditService = (service: Service): void => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      estimatedDuration: service.estimatedDuration.toString()
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (serviceId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await vendorAPI.removeService(serviceId);
        setSuccess('Service deleted successfully');
        await fetchVendorData();
      } catch (err: any) {
        setError('Failed to delete service');
      }
    }
  };

  // Technician Management Functions
  const handleTechSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (!vendor) return;

      // keep skills as comma-separated string and experience as string to match TechnicianFormData
      if (editingTech) {
        await vendorAPI.updateTechnician(editingTech._id, techForm);
        setSuccess('Technician updated successfully');
      } else {
        await vendorAPI.addTechnician(vendor._id, techForm);
        setSuccess('Technician added successfully');
      }
      setTechDialogOpen(false);
      resetTechForm();
      await fetchVendorData();
    } catch (err: any) {
      setError('Failed to save technician');
      console.error('Error saving technician:', err);
    }
  };

  const handleEditTech = (tech: Technician): void => {
    setEditingTech(tech);
    setTechForm({
      name: tech.name,
      skills: tech.skills.join(', '),
      phone: tech.phone,
      experience: tech.experience.toString(),
      available: tech.available
    });
    setTechDialogOpen(true);
  };

  const handleDeleteTech = async (techId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      try {
        await vendorAPI.removeTechnician(techId);
        setSuccess('Technician deleted successfully');
        await fetchVendorData();
      } catch (err: any) {
        setError('Failed to delete technician');
      }
    }
  };

  const resetServiceForm = (): void => {
    setServiceForm({
      name: '',
      description: '',
      price: '',
      category: '',
      estimatedDuration: ''
    });
    setEditingService(null);
  };

  const resetTechForm = (): void => {
    setTechForm({
      name: '',
      skills: '',
      phone: '',
      experience: '',
      available: true
    });
    setEditingTech(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress className="text-indigo-600" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <BusinessIcon className="text-gray-400 text-6xl mb-4 mx-auto" />
          <Typography variant="h5" className="text-gray-800 mb-2">
            No Vendor Profile Found
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-4">
            Please complete your vendor registration first.
          </Typography>
          <Button 
            variant="contained" 
            className="btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <Container maxWidth="xl">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <Typography variant="h4" className="font-bold text-gray-800">
                  Vendor Dashboard
                </Typography>
                <Typography variant="subtitle1" className="text-blue-600">
                  {vendor?.businessName}
                </Typography>
              </div>
              <div className="flex items-center space-x-4">
                <Chip 
                  icon={<StarIcon className="text-amber-500" />} 
                  label={`Rating: ${vendor?.rating || 'No ratings'}`}
                  className="bg-amber-100 text-amber-800"
                />
                <Chip 
                  label={`${services.length} Services`}
                  className="bg-blue-100 text-blue-800"
                />
                <Chip 
                  label={`${technicians.length} Technicians`}
                  className="bg-green-100 text-green-800"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container maxWidth="xl" className="py-8">
        {error && (
          <Alert severity="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Paper className="mb-8 rounded-2xl shadow-lg border border-blue-100">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"
            textColor="inherit"
          >
            <Tab 
              icon={<BuildIcon className="text-white mr-2" />} 
              label="Services" 
              className="text-white"
            />
            <Tab 
              icon={<PersonIcon className="text-white mr-2" />} 
              label="Technicians" 
              className="text-white"
            />
            <Tab 
              icon={<BusinessIcon className="text-white mr-2" />} 
              label="Business Info" 
              className="text-white"
            />
          </Tabs>

          {/* Services Tab */}
          <TabPanel value={activeTab} index={0}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="text-gray-800">
                Manage Services
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setServiceDialogOpen(true)}
                className="btn-primary"
              >
                Add Service
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service._id}>
                  <Card className="card hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Typography variant="h6" className="text-gray-800">
                          {service.name}
                        </Typography>
                        <div className="flex space-x-1">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditService(service)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteService(service._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                      
                      <Typography variant="body2" className="text-gray-600 mb-3">
                        {service.description}
                      </Typography>
                      
                      <div className="flex justify-between items-center mb-3">
                        <Chip 
                          label={service.category} 
                          size="small"
                          className="bg-blue-100 text-blue-800 capitalize"
                        />
                        <Typography variant="h6" className="text-green-600">
                          ₹{service.price}
                        </Typography>
                      </div>
                      
                      <Typography variant="body2" className="text-gray-500">
                        Duration: {service.estimatedDuration} mins
                      </Typography>

                      {service.averageRating && (
                        <div className="flex items-center mt-2">
                          <StarIcon className="text-amber-500 text-sm" />
                          <Typography variant="body2" className="text-gray-600 ml-1">
                            {service.averageRating.toFixed(1)} ({service.reviewCount} reviews)
                          </Typography>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {services.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="text-center py-12">
                    <BuildIcon className="text-gray-400 text-6xl mb-4" />
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      No Services Added
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mb-4">
                      Start by adding your first service
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setServiceDialogOpen(true)}
                      className="btn-primary"
                    >
                      Add Your First Service
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Technicians Tab */}
          <TabPanel value={activeTab} index={1}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="text-gray-800">
                Manage Technicians
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTechDialogOpen(true)}
                className="btn-primary"
              >
                Add Technician
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technicians.map((tech) => (
                <div key={tech._id}>
                  <Card className="card hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Typography variant="h6" className="text-gray-800">
                          {tech.name}
                        </Typography>
                        <div className="flex space-x-1">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTech(tech)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTech(tech._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Typography variant="body2" className="text-gray-600 mb-2">
                          Skills:
                        </Typography>
                        <div className="flex flex-wrap gap-1">
                          {tech.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              className="bg-green-100 text-green-800"
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <Typography variant="body2" className="text-gray-600">
                          Phone: {tech.phone}
                        </Typography>
                        <Chip
                          label={tech.available ? 'Available' : 'Busy'}
                          size="small"
                          color={tech.available ? 'success' : 'default'}
                        />
                      </div>
                      
                      <Typography variant="body2" className="text-gray-500">
                        Experience: {tech.experience} years
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {technicians.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="text-center py-12">
                    <PersonIcon className="text-gray-400 text-6xl mb-4" />
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      No Technicians Added
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mb-4">
                      Add technicians to handle service requests
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setTechDialogOpen(true)}
                      className="btn-primary"
                    >
                      Add Your First Technician
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Business Info Tab */}
          <TabPanel value={activeTab} index={2}>
            {vendor && (
              <>
                <Typography variant="h5" className="text-gray-800 mb-6">
                  Business Information
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Card className="card">
                      <CardContent className="p-6">
                        <Typography variant="h6" className="text-gray-800 mb-4">
                          Basic Information
                        </Typography>
                        
                        <div className="space-y-3">
                          <div>
                            <Typography variant="body2" className="text-gray-500">
                              Business Name
                            </Typography>
                            <Typography variant="body1" className="text-gray-800">
                              {vendor.businessName}
                            </Typography>
                          </div>
                          
                          <div>
                            <Typography variant="body2" className="text-gray-500">
                              GST Number
                            </Typography>
                            <Typography variant="body1" className="text-gray-800">
                              {vendor.gstNumber || 'Not provided'}
                            </Typography>
                          </div>
                          
                          <div>
                            <Typography variant="body2" className="text-gray-500">
                              Contact Email
                            </Typography>
                            <Typography variant="body1" className="text-gray-800">
                              {vendor.contactEmail}
                            </Typography>
                          </div>
                          
                          <div>
                            <Typography variant="body2" className="text-gray-500">
                              Contact Phone
                            </Typography>
                            <Typography variant="body1" className="text-gray-800">
                              {vendor.contactPhone}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="card">
                      <CardContent className="p-6">
                        <Typography variant="h6" className="text-gray-800 mb-4">
                          Service Areas
                        </Typography>
                        
                        {vendor.serviceAreas && vendor.serviceAreas.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {vendor.serviceAreas.map((area, index) => (
                              <Chip
                                key={index}
                                label={area}
                                className="bg-blue-100 text-blue-800"
                              />
                            ))}
                          </div>
                        ) : (
                          <Typography variant="body2" className="text-gray-500">
                            No service areas specified
                          </Typography>
                        )}
                        
                        <div className="mt-6">
                          <Typography variant="body2" className="text-gray-500 mb-2">
                            Address
                          </Typography>
                          <Typography variant="body1" className="text-gray-800">
                            {vendor.address}
                          </Typography>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="card mt-6">
                  <CardContent className="p-6">
                    <Typography variant="h6" className="text-gray-800 mb-4">
                      Business Statistics
                    </Typography>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <Typography variant="h4" className="text-blue-600 font-bold">
                          {services.length}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Total Services
                        </Typography>
                      </div>
                      <div className="text-center">
                        <Typography variant="h4" className="text-green-600 font-bold">
                          {technicians.length}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Technicians
                        </Typography>
                      </div>
                      <div className="text-center">
                        <Typography variant="h4" className="text-amber-600 font-bold">
                          {vendor.rating || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Average Rating
                        </Typography>
                      </div>
                      <div className="text-center">
                        <Typography variant="h4" className="text-purple-600 font-bold">
                          {vendor.serviceAreas?.length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Service Areas
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabPanel>
        </Paper>

        {/* Service Dialog */}
        <Dialog 
          open={serviceDialogOpen} 
          onClose={() => {
            setServiceDialogOpen(false);
            resetServiceForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <form onSubmit={handleServiceSubmit}>
            <DialogContent className="space-y-4 pt-6">
              <TextField
                fullWidth
                label="Service Name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                required
                className="input-field"
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                required
                className="input-field"
              />
              
              <FormControl fullWidth className="input-field">
                <InputLabel>Category</InputLabel>
                <Select
                  value={serviceForm.category}
                  label="Category"
                  onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                  required
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="appliances">Appliances</MenuItem>
                  <MenuItem value="plumbing">Plumbing</MenuItem>
                  <MenuItem value="electrical">Electrical</MenuItem>
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                required
                className="input-field"
              />
              
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={serviceForm.estimatedDuration}
                onChange={(e) => setServiceForm({...serviceForm, estimatedDuration: e.target.value})}
                required
                className="input-field"
              />
            </DialogContent>
            <DialogActions className="p-6">
              <Button 
                onClick={() => {
                  setServiceDialogOpen(false);
                  resetServiceForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                className="btn-primary"
              >
                {editingService ? 'Update Service' : 'Add Service'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Technician Dialog */}
        <Dialog 
          open={techDialogOpen} 
          onClose={() => {
            setTechDialogOpen(false);
            resetTechForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {editingTech ? 'Edit Technician' : 'Add New Technician'}
          </DialogTitle>
          <form onSubmit={handleTechSubmit}>
            <DialogContent className="space-y-4 pt-6">
              <TextField
                fullWidth
                label="Technician Name"
                value={techForm.name}
                onChange={(e) => setTechForm({...techForm, name: e.target.value})}
                required
                className="input-field"
              />
              
              <TextField
                fullWidth
                label="Skills (comma separated)"
                value={techForm.skills}
                onChange={(e) => setTechForm({...techForm, skills: e.target.value})}
                placeholder="e.g., AC Repair, Refrigerator Service, Installation"
                required
                className="input-field"
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                value={techForm.phone}
                onChange={(e) => setTechForm({...techForm, phone: e.target.value})}
                required
                className="input-field"
              />
              
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={techForm.experience}
                onChange={(e) => setTechForm({...techForm, experience: e.target.value})}
                required
                className="input-field"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={techForm.available}
                    onChange={(e) => setTechForm({...techForm, available: e.target.checked})}
                    color="primary"
                  />
                }
                label="Available for assignments"
              />
            </DialogContent>
            <DialogActions className="p-6">
              <Button 
                onClick={() => {
                  setTechDialogOpen(false);
                  resetTechForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                className="btn-primary"
              >
                {editingTech ? 'Update Technician' : 'Add Technician'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </div>
  );
};

export default VendorDashboard;