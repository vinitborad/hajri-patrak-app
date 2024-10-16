import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateStudentsViewDataScreen = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStoredStudents = async () => {
      try {
        const data = await AsyncStorage.getItem('fetched_students');
        if (data) {
          setStudents(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStoredStudents();
  }, []);

  const renderHeader = () => {
    return (
      <View style={styles.row}>
        {['Username', 'Email', 'Phone', 'FirstName', 'LastName', 'Address', 'ParentPhone'].map((header) => (
          <View style={styles.cell} key={header}>
            <Text style={styles.headerText}>{header}</Text>
          </View>
        ))}
      </View>
    );
  };

  // @ts-ignore
  const renderRow = (student, index) => {
    return (
      <View style={styles.row} key={index}>
        <View style={styles.cell}><Text style={styles.cellText}>{student.username}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.email}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.phone}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.firstName}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.lastName}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.address}</Text></View>
        <View style={styles.cell}><Text style={styles.cellText}>{student.parentPhone}</Text></View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students Data</Text>
      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          {renderHeader()}

          {/* Table Rows */}
          <ScrollView>
            {students.map((student, index) => renderRow(student, index))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateStudentsViewDataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#9DBDFF',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#9DBDFF',
  },
  cell: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#9DBDFF',
    minWidth: 150,  // You can adjust this to ensure a base minimum width
    justifyContent: 'center',
  },
  headerText: {
    color: '#9DBDFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellText: {
    color: '#F6F5F5',
    textAlign: 'center',
  },
});
