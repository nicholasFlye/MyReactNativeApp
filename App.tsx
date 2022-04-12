/*Filename: App.js
 *Author: Nicholas Flye
 *Purpose: Weather App T-Minus Solutions project
 *Date: 04/11/2022
 */
import React, {useEffect, useState} from 'react';
import { ActivityIndicator, FlatList, Text, View, TouchableOpacity, StyleSheet, SectionList, StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Store latlong pairs
var houston = [29.760427, -95.369804];
var stafford = [29.6148,-95.55709];
var sugarland = [29.597075, -95.6209];
var pearland = [29.55093, -95.25687];
var conroe = [30.313044, -95.45814];

var cities = [houston, stafford, sugarland, pearland, conroe];
var apicalls = [];
var locationKeys = [];
//Prep api calls for location keys
cities.forEach(city => {
  apicalls.push("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=91Qpo37fVmVhUrzl1HM1tXKNbFWkyyaG&q=" + city[0]+","+city[1]);
});
//Array for temperatures
var celcius = [];

//Item for section list
const Item = ({ title}) => (
  <View style={styles.item}>
    <Text style={styles.item}>{title}</Text>
  </View>
);

/*Function: HomeScreen
 *Purpose: for Home Screen that displays all cities and api pulled temperature data.
 *Return: 
 */
function HomeScreen({navigation}) {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  //Async function call to retrieve location keys and temperatures for each city
  const getLocationKeys_Temps = async () => {
    try {
      for(var i = 0; i < apicalls.length; i++)
      {
        const response = await fetch(apicalls[i]);
        const json = await response.json();
        setData(json);
        locationKeys.push(json.Key);
      }
     for(var i = 0; i < apicalls.length; i++)
      {
        apicalls[i] = "http://dataservice.accuweather.com/currentconditions/v1/" + locationKeys[i] +"?apikey=91Qpo37fVmVhUrzl1HM1tXKNbFWkyyaG";
      }
      for(var i = 0; i < apicalls.length; i++)
      {
        const response = await fetch("http://dataservice.accuweather.com/currentconditions/v1/" + locationKeys[i] +"?apikey=91Qpo37fVmVhUrzl1HM1tXKNbFWkyyaG");
        const json = await response.json();
        celcius.push(json[0].Temperature.Imperial.Value);
      }
      setData(celcius);

   } catch (error) {
     console.error(error);
   } finally {
     setLoading(false);
   }
 }

 useEffect(() => {
   getLocationKeys_Temps();
 }, []);

 //Data array made for the SectionsList
 var DATA = 
  [
    {
      title: "Houston",
      data: ["Lat: " + houston[0], "Long: " + houston[1], "Temp: " + celcius[0] + "°F"],
      index: 0
    },
    {
      title: "Stafford",
      data: ["Lat: " + stafford[0], "Long: " + stafford[1], "Temp: " + celcius[1] + "°F"],
      index: 1
    },
    {
      title: "Sugar Land",
      data: ["Lat: " + sugarland[0], "Long: " + sugarland[1], "Temp: "+ celcius[2] + "°F"],
      index: 2
    },
    {
      title: "Pearland",
      data: ["Lat: " + pearland[0], "Long: " + pearland[1], "Temp: "+ celcius[3] + "°F"],
      index: 3
    },
    {
      title: "Conroe",
      data: ["Lat: " + conroe[0], "Long: " + conroe[1], "Temp: "+ celcius[4] + "°F"],
      index: 4
    },
    {
      title: "Limgrave",
      data: ["Country: The Lands Between", "Origin: Elden Ring", "Temp: "+ celcius[4] + "°F"],
      index: 4
    }
    
  ]


  return (
    
    <View style={{ flex: 1}}>
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={DATA}
        renderItem={({ item }) => <Item title={item} />}
        renderSectionHeader={({ section: {title}}) => (
          //Call to go to next screen and pass in a particular city's index (hard coded value)
          <TouchableOpacity onPress={() => navigation.navigate('Detailed', {i: 0})}>
              <Text style={styles.header}>{title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/*Function: DetailedScreen
 *Purpose: for Details Screen, extra details are displayed for each city.
 *Return: 
 */
function DetailedScreen({route}) {

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getMoreDetails = async () => {
    console.log("new details");
    console.log(route.params.i);
    var index = route.params.i;
    try {
      const response = await fetch(apicalls[index]);
      const json = await response.json();
      setData(json);
      console.log(json[0]);
   } catch (error) {
     console.error(error);
   } finally {
     setLoading(false);
   }
 }

 useEffect(() => {
   getMoreDetails();
 }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>View More Details</Text>
      {isLoading ? <ActivityIndicator/> : (
        <FlatList
          data={data}
          keyExtractor={({ id }, index) => id}
          renderItem={({ item }) => (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.item}>Temperature Farenheit: {item.Temperature.Imperial.Value} °F</Text>
              <Text style={styles.item}>Temperature Celcius: {item.Temperature.Metric.Value} °C</Text>
              <Text style={styles.item}>Weather: {item.WeatherText}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const Stack = createNativeStackNavigator();
/*Function: App
 *Purpose: Code to control app navigation.
 *Return: 
 */
function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home (Press city name for more details)" component={HomeScreen} />
        <Stack.Screen name="Detailed" component={DetailedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16
  },
  item: {
    fontSize: 20,
    padding: 5,
    paddingLeft:10
  },
  header: {
    fontSize: 32,
    backgroundColor: "#00c200",
    fontWeight: "bold",
    color: '#fff',
    paddingLeft:5
  },
  title: {
    fontSize: 24,
    fontWeight: "bold"
  }
});

export default App;