'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Service, Review } from '@/types';
import { vendorAPI, reviewAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ServiceWithReviews extends Service {
  serviceId: string;
  vendorName?: string;
  vendorRating?: number;
  reviews?: Review[];
  averageRating: number;
  reviewCount: number;
}

export const ServiceGrid: React.FC = () => {
  const [services, setServices] = useState<ServiceWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTexts, setReviewTexts] = useState<{ [key: string]: string }>({});
  const [reviewRatings, setReviewRatings] = useState<{ [key: string]: number }>({});
  const [submittingReviews, setSubmittingReviews] = useState<{ [key: string]: boolean }>({});
  const { user, isAuthenticated } = useAuth();
  
  const { 
    joinServiceReviews, 
    onNewServiceReview, 
    removeAllListeners 
  } = useWebSocket();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    
    onNewServiceReview((newReview: Review) => {
      
      setServices(prev => prev.map(service => {
        if (service.serviceId === newReview.serviceId) {
          const updatedReviews = uniqueReviews([newReview, ...(service.reviews || [])]);
          const averageRating = calculateAverageRating(updatedReviews);
          return {
            ...service,
            reviews: updatedReviews,
            averageRating,
            reviewCount: updatedReviews.length
          };
        }
        return service;
      }));

      toast.success(`New review from ${newReview.userName}`);
    });

    return () => {
      removeAllListeners('newServiceReview');
    };
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getAll();
      const allServices: ServiceWithReviews[] = response.data.vendors.flatMap(
        (vendor: any) => vendor.servicesOffered.map((service: any) => ({
          ...service,
          _id: service.serviceId || service._id,
          serviceId: service.serviceId || service._id,
          vendorName: vendor.businessName,
          vendorRating: vendor.rating,
          vendorId: vendor._id,
          reviews: [],
          averageRating: 0,
          reviewCount: 0
        }))
      );
      const limitedServices = allServices.slice(0, 6);
      setServices(limitedServices);
      
      limitedServices.forEach(service => {
        joinServiceReviews(service.serviceId);
      });
      
      await fetchAllReviews(limitedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
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

  const fetchAllReviews = async (services: ServiceWithReviews[]) => {
    try {
      const reviewPromises = services.map(service => 
        reviewAPI.getServiceReviews(service.serviceId)
      );
      
      const reviewsResponses = await Promise.all(reviewPromises);
      
      const updatedServices = services.map((service, index) => {
        const reviews = reviewsResponses[index].data.reviews || [];
        const deduped = uniqueReviews(reviews);
        const averageRating = calculateAverageRating(deduped);
        return {
          ...service,
          reviews: deduped,
          averageRating,
          reviewCount: deduped.length
        };
      });
      
      setServices(updatedServices);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleReviewSubmit = async (serviceId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to post a review');
      return;
    }

    const reviewText = reviewTexts[serviceId]?.trim();
    const rating = reviewRatings[serviceId];

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
    setSubmittingReviews(prev => ({ ...prev, [serviceId]: true }));

    try {
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
      const optimisticReview: Review = {
        _id: optimisticId,
        serviceId,
        userId: user._id,
        userName: user.name,
        rating: integerRating,
        comment: reviewText,
        type: 'service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // add optimistic review (deduped)
      setServices(prev => prev.map(s => {
        if (s.serviceId === serviceId) {
          const newReviews = uniqueReviews([optimisticReview, ...(s.reviews || [])]);
          return {
            ...s,
            reviews: newReviews,
            averageRating: calculateAverageRating(newReviews),
            reviewCount: newReviews.length
          };
        }
        return s;
      }));

      setReviewTexts(prev => ({ ...prev, [serviceId]: '' }));
      setReviewRatings(prev => ({ ...prev, [serviceId]: 0 }));

      const response = await reviewAPI.submitReview({
        serviceId,
        rating: integerRating,
        comment: reviewText,
        userName: user.name,
        type: 'service'
      });

      // replace optimistic with server review (dedupe)
      setServices(prev => prev.map(s => {
        if (s.serviceId === serviceId) {
          const filtered = s.reviews?.filter(r => !r._id.startsWith('optimistic-')) || [];
          const newReviews = uniqueReviews([response.data.review, ...filtered]);
          return {
            ...s,
            reviews: newReviews,
            averageRating: calculateAverageRating(newReviews),
            reviewCount: newReviews.length
          };
        }
        return s;
      }));

      toast.success('Review submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      // revert optimistic review
      setServices(prev => prev.map(s => {
        if (s.serviceId === serviceId) {
          const filtered = s.reviews?.filter(r => !r._id.startsWith('optimistic-')) || [];
          return {
            ...s,
            reviews: filtered,
            averageRating: calculateAverageRating(filtered),
            reviewCount: filtered.length
          };
        }
        return s;
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
        toast.error('You can submit multiple reviews now. Please try again.');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to submit review';
        toast.error(errorMessage);
      }
    } finally {
      setSubmittingReviews(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleRatingChange = (serviceId: string, rating: number) => {
    setReviewRatings(prev => ({ ...prev, [serviceId]: rating }));
  };

  const handleReviewTextChange = (serviceId: string, text: string) => {
    setReviewTexts(prev => ({ ...prev, [serviceId]: text }));
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Popular Services</h2>
        <button className="text-primary-600 hover:text-primary-700 font-medium">
          View All →
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const averageRating = service.averageRating;
          const serviceReviews = service.reviews || [];

          return (
            <motion.div
              key={service.serviceId} // <- stable key
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                expandable
                expandedContent={
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-600">{service.estimatedDuration} mins</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {averageRating}/5 ({service.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Customer Reviews ({service.reviewCount})
                      </h4>
                      
                      {serviceReviews.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {serviceReviews.map((review: Review) => (
                            <div key={`${review._id}-${review.createdAt}`} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                                  {review.userName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-sm">{review.userName}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${
                                        i < review.rating 
                                          ? 'text-yellow-500 fill-current' 
                                          : 'text-gray-300'
                                      }`} 
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
                        <p className="text-gray-500 text-center py-4">
                          No reviews yet. Be the first to review this service!
                        </p>
                      )}

                      {/* Review Form */}
                      <div className="mt-6">
                        <h5 className="font-semibold text-gray-900 mb-3">
                          {isAuthenticated ? 'Write a Review' : 'Login to Write a Review'}
                        </h5>
                        
                        {isAuthenticated ? (
                          <>
                           <div className="flex items-center space-x-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRatingChange(service.serviceId, star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className={`w-6 h-6 ${
                                      star <= (reviewRatings[service.serviceId] || 0)
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    } hover:text-yellow-500`}
                                  />
                                </button>
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {reviewRatings[service.serviceId] || 0}/5
                                {reviewRatings[service.serviceId] && ` (${Math.floor(reviewRatings[service.serviceId])})`}
                              </span>
                            </div>

                            <textarea
                              placeholder="Share your experience with this service..."
                              value={reviewTexts[service.serviceId] || ''}
                              onChange={(e) => handleReviewTextChange(service.serviceId, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                              rows={3}
                              minLength={10}
                              maxLength={500}
                            />
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {reviewTexts[service.serviceId]?.length || 0}/500 characters
                              {reviewTexts[service.serviceId]?.length < 10 && ' (minimum 10 required)'}
                            </div>
                            <button
                              onClick={() => handleReviewSubmit(service.serviceId)}
                              disabled={submittingReviews[service.serviceId]}
                              className="mt-2 bg-primary-600 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingReviews[service.serviceId] ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Please login to share your experience with this service.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-2xl font-bold text-primary-600">₹{service.price}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.estimatedDuration} mins</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{averageRating} ({service.reviewCount})</span>
                      </div>
                    </div>
                    <span className="capitalize px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                      {service.category}
                    </span>
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