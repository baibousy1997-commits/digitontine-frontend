// src/services/notification/notificationService.js
import apiClient from '../api/apiClient';

const BASE_URL = '/notifications';

/**
 * Récupérer mes notifications
 */
const getMyNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL;
    
    const response = await apiClient.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(' Erreur getMyNotifications:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Obtenir le nombre de notifications non lues
 */
const getUnreadCount = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/unread-count`);
    return { success: true, count: response.data.count };
  } catch (error) {
    console.error(' Erreur getUnreadCount:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${notificationId}/read`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(' Erreur markAsRead:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async () => {
  try {
    const response = await apiClient.put(`${BASE_URL}/mark-all-read`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(' Erreur markAllAsRead:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Accepter ou refuser participation au tirage
 */
const takeAction = async (notificationId, action) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/${notificationId}/action`, {
      action, // 'accepted' ou 'refused'
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(' Erreur takeAction:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (notificationId) => {
  try {
    await apiClient.delete(`${BASE_URL}/${notificationId}`);
    return { success: true };
  } catch (error) {
    console.error(' Erreur deleteNotification:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  takeAction,
  deleteNotification,
};