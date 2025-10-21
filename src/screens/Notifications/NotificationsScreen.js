import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getNotifications } from '../../services/notificationService';


const NotificationsScreen = () => {
const [notifications, setNotifications] = useState([]);


useEffect(() => {
(async () => {
const data = await getNotifications();
setNotifications(data);
})();
}, []);


return (
<View style={styles.container}>
<Text style={styles.title}>Notifications</Text>
<FlatList
data={notifications}
keyExtractor={(item) => item.id.toString()}
renderItem={({ item }) => (
<View style={styles.card}>
<Text style={styles.message}>{item.message}</Text>
<Text style={styles.date}>{item.date}</Text>
</View>
)}
/>
</View>
);
};


const styles = StyleSheet.create({
container: { flex: 1, padding: 16, backgroundColor: '#fff' },
title: { fontSize: 22, fontWeight: 'bold', color: '#004aad', marginBottom: 16 },
card: {
backgroundColor: '#f8f9fa',
padding: 14,
borderRadius: 10,
marginBottom: 10,
borderLeftWidth: 5,
borderLeftColor: '#004aad',
},
message: { fontSize: 16, color: '#333' },
date: { fontSize: 12, color: '#666', marginTop: 4 },
});


export default NotificationsScreen;