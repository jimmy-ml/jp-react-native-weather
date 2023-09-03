import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { Input, ListItem } from 'react-native-elements';
import axios from 'axios';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (searchText) {
      axios
        .get(`https://geocoding-api.open-meteo.com/v1/search?name=${searchText}`)
        .then((response) => {
          setSuggestions(response.data.results);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,windspeed_10m,rain&forecast_days=1`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setSearchText('');

    const data = await fetchWeatherData(item.latitude, item.longitude);

    if (data) {
      setWeatherData(data);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Escribe el nombre de la ciudad..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      {suggestions && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectItem(item)}>
              <Text style={styles.listItem}>{item.name}, {item.country}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {selectedItem && (
        <View style={styles.selectedItemContainer}>
          <Text>Nombre: {selectedItem.name}</Text>
          <Text>País: {selectedItem.country}</Text>
          {weatherData && (
            <>
              <Text>Temperatura (mínima): {Math.min(...weatherData.hourly.temperature_2m)} {weatherData.hourly_units.temperature_2m}</Text>
              <Text>Temperatura (máxima): {Math.max(...weatherData.hourly.temperature_2m)} {weatherData.hourly_units.temperature_2m}</Text>
              <Text>Viento (mínimo): {Math.min(...weatherData.hourly.windspeed_10m)} {weatherData.hourly_units.windspeed_10m}</Text>
              <Text>Viento (máximo): {Math.max(...weatherData.hourly.windspeed_10m)} {weatherData.hourly_units.windspeed_10m}</Text>
              <Text>Lluvia (mínima): {Math.min(...weatherData.hourly.rain)} {weatherData.hourly_units.rain}</Text>
              <Text>Lluvia (máxima): {Math.max(...weatherData.hourly.rain)} {weatherData.hourly_units.rain}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 90,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedItemContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
});

export default SearchBar;
