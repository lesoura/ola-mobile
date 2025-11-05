import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Row, Table } from 'react-native-table-component';

export default function HomeScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const tableHead = ['Reference ID', 'Transaction Date', 'Loan Amount', 'Loan Status'];
  const tableData = [
    ['LA1041101356211', '2025-10-29', '$5000', 'Approved'],
    ['LA1041101356212', '2025-10-30', '$1500', 'Pending'],
    ['LA1041101356213', '2025-10-31', '$2500', 'Rejected'],
    ['LA1041101356214', '2025-11-01', '$3000', 'Approved'],
    ['LA1041101356215', '2025-11-02', '$1200', 'Pending'],
    ['LA1041101356216', '2025-11-03', '$4500', 'Approved'],
    ['LA1041101356218', '2025-11-05', '$2200', 'Approved'],
    ['LA1041101356219', '2025-11-06', '$6000', 'Pending'],
    ['LA1041101356220', '2025-11-07', '$5000', 'Approved'],
  ];

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const currentData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Statistics data
  const numLoans = tableData.length;
  const totalAmount = tableData.reduce((sum, row) => sum + parseInt(row[2].replace('$','')), 0);
  const pendingLoans = tableData.filter(row => row[3] === 'Pending').length;

  return (
    <View style={styles.container}>
      {/* Main Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("@/components/ui/munchkin.jpeg")} // replace with an image if available
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>John Munchkin</Text>
        <Text style={styles.cardTitle}>Manage Loans</Text>
        <Text style={styles.cardSubtitle}>View and manage all your loan applications</Text>

        {/* Statistic Card inside cardHeader */}
        <View style={styles.statsCard}>
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>{numLoans}</Text>
            <Text style={styles.statsLabel}>Loans</Text>
          </View>
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>${totalAmount}</Text>
            <Text style={styles.statsLabel}>Total Amount</Text>
          </View>
          <View style={styles.statsColumn}>
            <Text style={styles.statsValue}>{pendingLoans}</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Table Card */}
      <View style={styles.tableCard}>
        <Table>
          <Row data={tableHead} style={styles.tableHead} textStyle={styles.tableHeadText} />
          {currentData.map((rowData, index) => (
            <Row
            key={index}
            data={rowData}
            style={{
              height: 40,
              backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.1)', // faded horizontal line
            }}
            textStyle={styles.tableText}
          />
          ))}
        </Table>
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          onPress={handlePrev} disabled={currentPage === 1}>
          <Text style={styles.paginationButtonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          onPress={handleNext} disabled={currentPage === totalPages}>
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.applyButtonText}>Apply for Loan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 15 },
  cardHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30, // space for table
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    alignItems: 'center',
    position: 'relative', // needed for statsCard layering
    marginTop:20
  },
  avatarContainer: { marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 50, backgroundColor: '#ddd' },
  userName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#ff5a5f' },
  cardSubtitle: { fontSize: 14, color: '#333', marginTop: 4, marginBottom:50, textAlign: 'center' },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: -30, // half outside the cardHeader
    left: 15,
    right: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    zIndex: 10,
  },
  statsColumn: { alignItems: 'center' },
  statsValue: { fontSize: 20, fontWeight: 'bold', color: '#ff5a5f' },
  statsLabel: { fontSize: 12, color: '#333' },
  tableCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd', marginBottom: 10, marginTop: 20 },
  tableHead: {
    height: 40,
    backgroundColor: 'transparent', // no background
    borderBottomWidth: 1,           // bottom border
    borderColor: '#ff5a5f',         // border color
  },
  tableHeadText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',               // header text color
  },
  tableText: {
    textAlign: 'center',
    fontSize: 14,
    // normal row text style (no color here, or default)
  },
  noteContainer: { marginBottom: 10 },
  noteText: { fontSize: 12, color: '#333', textAlign: 'justify' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 },
  paginationButton: { borderColor: '#ff5a5f', borderWidth:1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 25, marginLeft: 5 },
  paginationButtonText: { color: '#ff5a5f', fontWeight: 'bold', fontSize: 14 },
  disabledButton: { opacity: 0.5 },
  pageIndicator: { fontSize: 14, fontWeight: 'bold', color: '#333', marginHorizontal: 10 },
  applyButton: {
    position: 'absolute',
    bottom: 50, // distance from bottom
    left: 15,   // spacing from left edge
    right: 15,  // spacing from right edge
    backgroundColor: '#ff5a5f',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
