import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting WebSocket');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinServiceReviews = (serviceId) => {
    if (socketRef.current && serviceId) {
      socketRef.current.emit('joinServiceReviews', serviceId);
    }
  };

  const joinVendorReviews = (vendorId) => {
    if (socketRef.current && vendorId) {
      socketRef.current.emit('joinVendorReviews', vendorId);
    }
  };

  const joinTechnicianReviews = (technicianId) => {
    if (socketRef.current && technicianId) {
      socketRef.current.emit('joinTechnicianReviews', technicianId);
    }
  };

  const onNewServiceReview = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('newServiceReview', callback);
    }
  };

  const onNewVendorReview = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('newVendorReview', callback);
    }
  };

  const onNewTechnicianReview = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('newTechnicianReview', callback);
    }
  };

  const removeAllListeners = (event) => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners(event);
    }
  };

  return {
    joinServiceReviews,
    joinVendorReviews,
    joinTechnicianReviews,
    onNewServiceReview,
    onNewVendorReview,
    onNewTechnicianReview,
    removeAllListeners
  };
};