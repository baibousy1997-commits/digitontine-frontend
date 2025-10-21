import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getTransactions } from '../../api/tontineService';
import TransactionCard from '../../components/TransactionCard';


const TransactionListScreen = () => {
const { user } = useContext(AuthContext);
const [transactions, setTransactions] = useState([]);


useEffect(() => {
(async () => {
const data = await getTransactions(user?.id);
setTransactions(data);
})();
}, []);


return (
<View style={styles.container}>
<Text style={styles.title}>Historique des Transactions</Text>
<FlatList
data={transactions}
keyExtractor={(item) => item.id.toString()}
renderItem={({ item }) => <TransactionCard transaction={item} />}
/>
</View>
);
};


const styles = StyleSheet.create({
container: { flex: 1, padding: 16, backgroundColor: '#fff' },
title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#004aad' },
});


export default TransactionListScreen;