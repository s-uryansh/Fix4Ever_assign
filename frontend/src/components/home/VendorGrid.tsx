'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Vendor, Review } from '@/types';
import { vendorAPI, reviewAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';

interface VendorWithReviews extends Vendor {
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export const VendorGrid: React.FC = () => {
  const [vendors, setVendors] = useState<VendorWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTexts, setReviewTexts] = useState<{ [key: string]: string }>({});
  const [reviewRatings, setReviewRatings] = useState<{ [key: string]: number }>({});
  const [submittingReviews, setSubmittingReviews] = useState<{ [key: string]: boolean }>({});
  const { user, isAuthenticated } = useAuth();
  
  const { 
    joinVendorReviews, 
    onNewVendorReview, 
    removeAllListeners 
  } = useWebSocket();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    onNewVendorReview((newReview: Review) => {
      
      setVendors(prev => prev.map(vendor => {
        if (vendor._id === newReview.vendorId) {
          const updatedReviews = [newReview, ...(vendor.reviews || [])];
          return {
            ...vendor,
            reviews: updatedReviews,
            averageRating: calculateAverageRating(updatedReviews),
            reviewCount: updatedReviews.length
          };
        }
        return vendor;
      }));

      toast.info(`New review for vendor from ${newReview.userName}`);
    });

    return () => {
      removeAllListeners('newVendorReview');
    };
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getAll();
      const vendorsData: VendorWithReviews[] = response.data.vendors.slice(0, 4);
      setVendors(vendorsData);
      await fetchAllReviews(vendorsData);
      
      // Join WebSocket rooms for real-time updates
      vendorsData.forEach(vendor => {
        joinVendorReviews(vendor._id);
      });
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
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

  const fetchAllReviews = async (vendors: VendorWithReviews[]) => {
    try {
      const reviewPromises = vendors.map(vendor => 
        reviewAPI.getVendorReviews(vendor._id)
      );
      
      const reviewsResponses = await Promise.all(reviewPromises);
      
      const updatedVendors = vendors.map((vendor, index) => {
        const reviews = reviewsResponses[index].data.reviews || [];
        const deduped = uniqueReviews(reviews);
        return {
          ...vendor,
          reviews: deduped,
          averageRating: calculateAverageRating(deduped),
          reviewCount: deduped.length
        };
      });
      
      setVendors(updatedVendors);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleReviewSubmit = async (vendorId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to post a review');
      return;
    }

    const reviewText = reviewTexts[vendorId]?.trim();
    const rating = reviewRatings[vendorId];

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
    setSubmittingReviews(prev => ({ ...prev, [vendorId]: true }));

    try {
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
      const optimisticReview: Review = {
        _id: optimisticId,
        vendorId,
        userId: user._id,
        userName: user.name,
        rating: integerRating,
        comment: reviewText,
        type: 'vendor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setVendors(prev => prev.map(v => {
        if (v._id === vendorId) {
          const newReviews = uniqueReviews([optimisticReview, ...(v.reviews || [])]);
          return {
            ...v,
            reviews: newReviews,
            averageRating: calculateAverageRating(newReviews),
            reviewCount: newReviews.length
          };
        }
        return v;
      }));

      // clear inputs
      setReviewTexts(prev => ({ ...prev, [vendorId]: '' }));
      setReviewRatings(prev => ({ ...prev, [vendorId]: 0 }));

      const response = await reviewAPI.submitReview({
        vendorId,
        rating: integerRating,
        comment: reviewText,
        userName: user.name,
        type: 'vendor'
      });

      setVendors(prev => prev.map(v => {
        if (v._id === vendorId) {
          const filtered = v.reviews?.filter(r => !r._id.startsWith('optimistic-')) || [];
          const newReviews = uniqueReviews([response.data.review, ...filtered]);
          return {
            ...v,
            reviews: newReviews,
            averageRating: calculateAverageRating(newReviews),
            reviewCount: newReviews.length
          };
        }
        return v;
      }));

      toast.success('Review submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      // revert optimistic
      setVendors(prev => prev.map(v => {
        if (v._id === vendorId) {
          const filtered = v.reviews?.filter(r => !r._id.startsWith('optimistic-')) || [];
          return {
            ...v,
            reviews: filtered,
            averageRating: calculateAverageRating(filtered),
            reviewCount: filtered.length
          };
        }
        return v;
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
      setSubmittingReviews(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  const handleRatingChange = (vendorId: string, rating: number) => {
    setReviewRatings(prev => ({ ...prev, [vendorId]: rating }));
  };

  const handleReviewTextChange = (vendorId: string, text: string) => {
    setReviewTexts(prev => ({ ...prev, [vendorId]: text }));
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trusted Vendors</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Trusted Vendors</h2>
        <button className="text-primary-600 hover:text-primary-700 font-medium">
          View All →
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor, index) => {
          const vendorReviews = vendor.reviews || [];
          const averageRating = vendor.averageRating || calculateAverageRating(vendorReviews);

          return (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                expandable
                expandedContent={
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {vendor.businessName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{averageRating}/5 ({vendor.reviewCount || vendorReviews.length} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{vendor.serviceAreas.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Info</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-primary-600" />
                            <span className="text-sm">{vendor.contactPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-primary-600" />
                            <span className="text-sm">{vendor.contactEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span className="text-sm">{vendor.address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Services Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.servicesOffered.slice(0, 5).map((service) => (
                            <span
                              key={service._id}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                            >
                              {service.name}
                            </span>
                          ))}
                          {vendor.servicesOffered.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{vendor.servicesOffered.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Customer Reviews ({vendor.reviewCount || vendorReviews.length})
                      </h4>
                      
                      {vendorReviews.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {vendorReviews.map((review: Review) => (
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
                          No reviews yet. Be the first to review this vendor!
                        </p>
                      )}

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
                                  onClick={() => handleRatingChange(vendor._id, star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className={`w-6 h-6 ${
                                      star <= (reviewRatings[vendor._id] || 0)
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    } hover:text-yellow-500`}
                                  />
                                </button>
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {reviewRatings[vendor._id] || 0}/5
                                {reviewRatings[vendor._id] && ` (${Math.floor(reviewRatings[vendor._id])})`}
                              </span>
                            </div>

                            <textarea
                              placeholder="Share your experience with this vendor..."
                              value={reviewTexts[vendor._id] || ''}
                              onChange={(e) => handleReviewTextChange(vendor._id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                              rows={3}
                              minLength={10}
                              maxLength={500}
                            />
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {reviewTexts[vendor._id]?.length || 0}/500 characters
                              {reviewTexts[vendor._id]?.length < 10 && ' (minimum 10 required)'}
                            </div>
                            <button
                              onClick={() => handleReviewSubmit(vendor._id)}
                              disabled={submittingReviews[vendor._id]}
                              className="mt-2 bg-primary-600 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingReviews[vendor._id] ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Please login to share your experience with this vendor.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vendor.businessName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{averageRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.serviceAreas.join(', ')}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    Professional repair services with {vendor.technicians.length} certified technicians.
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {vendor.servicesOffered.slice(0, 3).map((service) => (
                        <span
                          key={service._id}
                          className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                        >
                          {service.name}
                        </span>
                      ))}
                      {vendor.servicesOffered.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{vendor.servicesOffered.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{vendor.reviewCount || vendorReviews.length} reviews</span>
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