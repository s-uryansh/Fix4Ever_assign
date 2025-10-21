'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Award, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Technician, Review } from '@/types';
import { vendorAPI, reviewAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';

interface TechnicianWithVendor extends Technician {
  vendorName: string;
  vendorRating: number;
  reviews?: Review[];
}

export const TechnicianGrid: React.FC = () => {
  const [technicians, setTechnicians] = useState<TechnicianWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTexts, setReviewTexts] = useState<{ [key: string]: string }>({});
  const [reviewRatings, setReviewRatings] = useState<{ [key: string]: number }>({});
  const [submittingReviews, setSubmittingReviews] = useState<{ [key: string]: boolean }>({});
  const { user, isAuthenticated } = useAuth();
  
  const { 
    joinTechnicianReviews, 
    onNewTechnicianReview, 
    removeAllListeners 
  } = useWebSocket();

  useEffect(() => {
    fetchTechnicians();
  }, []);


  useEffect(() => {
    onNewTechnicianReview((newReview: Review) => {
      setTechnicians(prev => prev.map((tech: TechnicianWithVendor) => {
        if (tech._id === newReview.technicianId) {
          const updatedReviews = uniqueReviews([newReview, ...(tech.reviews || [])]);
          return {
            ...tech,
            reviews: updatedReviews
          };
        }
        return tech;
      }));

      toast.info(`New review for technician from ${newReview.userName}`);
    });

    return () => {
      removeAllListeners('newTechnicianReview');
    };
  }, []);
  const fetchTechnicians = async () => {
    try {
      const response = await vendorAPI.getAll();
      const allTechnicians = response.data.vendors.flatMap((vendor: any) =>
        vendor.technicians.map((tech: Technician) => ({
          ...tech,
          vendorName: vendor.businessName,
          vendorRating: vendor.rating,
          reviews: []
        }))
      );
      const limitedTechnicians = allTechnicians.slice(0, 3);
      setTechnicians(limitedTechnicians);
      await fetchAllReviews(limitedTechnicians);
      
      limitedTechnicians.forEach((tech: TechnicianWithVendor) => {
        joinTechnicianReviews(tech._id);
      });
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  // helper: keep first occurrence of each review._id, preserve order
  const uniqueReviews = (reviews: Review[] = []) => {
    const map = new Map<string, Review>();
    for (const r of reviews) {
      if (!map.has(r._id)) {
        map.set(r._id, r);
      }
    }
    return Array.from(map.values());
  };

  const fetchAllReviews = async (technicians: TechnicianWithVendor[]) => {
    try {
      const reviewPromises = technicians.map((tech: TechnicianWithVendor) => 
        reviewAPI.getTechnicianReviews(tech._id)
      );
      
      const reviewsResponses = await Promise.all(reviewPromises);
      
      const updatedTechnicians = technicians.map((tech, index) => ({
        ...tech,
        reviews: uniqueReviews(reviewsResponses[index].data.reviews || [])
      }));
      
      setTechnicians(updatedTechnicians);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleReviewSubmit = async (technicianId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to post a review');
      return;
    }

    const reviewText = reviewTexts[technicianId]?.trim();
    const rating = reviewRatings[technicianId];

    if (!reviewText) {
      toast.error('Please enter a review');
      return;
    }

    if (reviewText.length < 10) {
      toast.error(`Review comment must be at least 10 characters long (currently ${reviewText.length})`);
      return;
    }

    if (reviewText.length > 500) {
      toast.error(`Review comment must be less than 500 characters (currently ${reviewText.length})`);
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    const integerRating = Math.floor(rating);
    setSubmittingReviews(prev => ({ ...prev, [technicianId]: true }));

    try {
      const optimisticReview: Review = {
        _id: `optimistic-${Date.now()}`,
        technicianId,
        userId: user._id,
        userName: user.name,
        rating: integerRating,
        comment: reviewText,
        type: 'technician',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTechnicians(prev => prev.map((tech: TechnicianWithVendor) => {
        if (tech._id === technicianId) {
          const newReviews = uniqueReviews([optimisticReview, ...(tech.reviews || [])]);
          return {
            ...tech,
            reviews: newReviews
          };
        }
        return tech;
      }));

      setReviewTexts(prev => ({ ...prev, [technicianId]: '' }));
      setReviewRatings(prev => ({ ...prev, [technicianId]: 0 }));

      const response = await reviewAPI.submitReview({
        technicianId,
        rating: integerRating,
        comment: reviewText,
        userName: user.name,
        type: 'technician'
      });

      setTechnicians(prev => prev.map((tech: TechnicianWithVendor) => {
        if (tech._id === technicianId) {
          const filteredReviews = tech.reviews?.filter((r: Review) => !r._id.startsWith('optimistic-')) || [];
          const newReviews = uniqueReviews([response.data.review, ...filteredReviews]);
          return {
            ...tech,
            reviews: newReviews
          };
        }
        return tech;
      }));

      toast.success('Review submitted successfully!');

    } catch (error: any) {
      console.error('Failed to submit review:', error);
      
      setTechnicians(prev => prev.map((tech: TechnicianWithVendor) => {
        if (tech._id === technicianId) {
          const filteredReviews = tech.reviews?.filter((r: Review) => !r._id.startsWith('optimistic-')) || [];
          return {
            ...tech,
            reviews: filteredReviews
          };
        }
        return tech;
      }));

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
        } else {
          toast.error(errorData.message || 'Validation failed');
        }
      } else if (error.response?.data?.message?.includes('duplicate key')) {
        toast.error('Database constraints still exist. Please contact administrator.');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to submit review';
        toast.error(errorMessage);
      }
    } finally {
      setSubmittingReviews(prev => ({ ...prev, [technicianId]: false }));
    }
  };


  const handleRatingChange = (technicianId: string, rating: number) => {
    setReviewRatings(prev => ({ ...prev, [technicianId]: rating }));
  };

  const handleReviewTextChange = (technicianId: string, text: string) => {
    setReviewTexts(prev => ({ ...prev, [technicianId]: text }));
  };

  const calculateAverageRating = (reviews: Review[] = []) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Technicians</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 mb-6"
      >
        Top Technicians
      </motion.h2>

      <div className="space-y-4">
        {technicians.map((tech: TechnicianWithVendor, index: number) => {
          const averageRating = calculateAverageRating(tech.reviews);
          const techReviews = tech.reviews || [];

          return (
            <motion.div
              key={tech._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                expandable
                expandedContent={
                  <div className="flex flex-col h-full">
                    {/* scrollable main area: details + reviews */}
                    <div className="overflow-y-auto pr-4" style={{ maxHeight: '60vh' }}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                            <p className="text-gray-600 mb-2">{tech.vendorName}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>{averageRating}/5 ({techReviews.length} reviews)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Award className="w-4 h-4 text-primary-600" />
                                <span>{tech.experience} years experience</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{tech.available ? 'Available Now' : 'Busy'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                              {tech.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-primary-600" />
                                <span className="text-sm">{tech.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <span className="text-sm">Service Area: City-wide</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Customer Reviews ({techReviews.length})</h4>
                          
                          {techReviews.length > 0 ? (
                            <div className="space-y-4">
                              {techReviews.map((review: Review) => (
                                <div key={review._id} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                                      {review.userName?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-sm">{review.userName}</span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this technician!</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* sticky footer with review form so Submit stays visible */}
                    <div className="sticky bottom-0 bg-white/95 border-t border-gray-200 z-10">
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900 mb-3">{isAuthenticated ? 'Write a Review' : 'Login to Write a Review'}</h5>
                        {isAuthenticated ? (
                          <div>
                            <div className="flex items-center space-x-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRatingChange(tech._id, star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className={`w-6 h-6 ${star <= (reviewRatings[tech._id] || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'} hover:text-yellow-500`}
                                  />
                                </button>
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {reviewRatings[tech._id] || 0}/5
                                {reviewRatings[tech._id] && ` (${Math.floor(reviewRatings[tech._id])})`}
                              </span>
                            </div>

                            <textarea
                              placeholder="Share your experience with this technician..."
                              value={reviewTexts[tech._id] || ''}
                              onChange={(e) => handleReviewTextChange(tech._id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                              rows={3}
                              minLength={10}
                              maxLength={500}
                            />
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {reviewTexts[tech._id]?.length || 0}/500 characters
                              {reviewTexts[tech._id]?.length < 10 && ' (minimum 10 required)'}
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => handleReviewSubmit(tech._id)}
                                disabled={submittingReviews[tech._id]}
                                className="bg-primary-600 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submittingReviews[tech._id] ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Please login to share your experience with this technician.</p>
                        )}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{tech.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{tech.vendorName}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{averageRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{tech.experience} yrs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className={tech.available ? 'text-green-600' : 'text-red-600'}>
                        {tech.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tech.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {tech.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{tech.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      Book Now
                    </button>
                    <span className="text-gray-500">{techReviews.length} reviews</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};