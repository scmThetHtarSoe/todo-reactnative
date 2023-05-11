import { StatusBar } from "expo-status-bar";
import { React, useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  VirtualizedList
} from "react-native";
import CheckBox from "react-native-check-box";
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    margin: 10,
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    padding: 2,
    borderRadius: 5,
  },
  appbar: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#FFC0CB",
  },

  form: {
    marginHorizontal: 10,
    marginVertical: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  formControlWrapper: {
    flex: 1,
    width: "85%",
    marginRight: 10,
  },
  formControl: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  addBtn: {
    width: "14%",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFC0CB",
    color: "#000",
    fontSize: 25,
    textAlign: "center",
    borderRadius: 5,
  },
  forGroup: {
    margin: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: "30%",
    paddingVertical: 8,
    textAlign: "center",
    backgroundColor: "#FFC0CB",
    borderRadius: 5,
  },
  actionAllBtn: {
    width: "43%",
    paddingVertical: 8,
    textAlign: "center",
    backgroundColor: "#FFC0CB",
    borderRadius: 5,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "red",
    fontSize: 20,
    color: "white",
  },
  leftItem: {
    marginRight: 30,
  },
  lineThrough: {
    textDecorationLine: "line-through",
  },
  activeItem: {
    fontWeight: "bold",
  },
});

const App = () => {
  let [items, setItem] = useState([]);
  let [leftItem, setLeftItem] = useState([0]);
  let [filteredItems, setFilteredItems] = useState(items);
  const [buttonText, setButtonText] = useState("");
  const [filter, setFilter] = useState("all");

  const [name, setName] = useState("");

  const updateLocalStorage = () => {
    AsyncStorage.setItem("todos", JSON.stringify(items));
  };

  //Add Item-------
  const add = () => {
    if (name.trim() !== "") {
      setItem([...items, { id: Date.now(), name, done: false }]);
      setName("");
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("todos")
      .then((data) => {
        if (data !== null) {
          setItem(JSON.parse(data));
        }
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    updateLocalStorage();
    filterItems("all");
    const getLeftItem = items.filter((item) => item.done === false).length;
    setLeftItem(getLeftItem);
    const getButtonText = getLeftItem === 0 ? "Uncheck All" : "Check All";
    setButtonText(getButtonText);
  }, [items]);

  //Single Check----------
  const handleCheck = (id, isChecked) => {
    const index = items.findIndex((item) => item.id === id);
    const toggleItem = { ...items[index], done: isChecked };
    const updatedItems = [
      ...items.slice(0, index),
      toggleItem,
      ...items.slice(index + 1),
    ];
    setItem(updatedItems);
  };

  //Check All----------
  const checkAll = () => {
    if (buttonText === "Check All") {
      const updatedItems = items.map((item) => ({ ...item, done: true }));
      setItem(updatedItems);
      setFilteredItems(updatedItems);
      setButtonText("Uncheck All");
    } else {
      const updatedItems = items.map((item) => ({ ...item, done: false }));
      setItem(updatedItems);
      setFilteredItems(updatedItems);
      setButtonText("Check All");
    }
  };

  //Clear Completed----------
  const clearCompleted = () => {
    const updatedItems = items.filter((item) => item.done !== true);
    setItem(updatedItems);
    setFilteredItems(updatedItems);
  };

  const filterItems = (condition) => {
    switch (condition) {
      case "all":
        setFilteredItems(items);
        break;
      case "active":
        setFilteredItems(items.filter((item) => item.done === false));
        break;
      case "completed":
        setFilteredItems(items.filter((item) => item.done === true));
        break;
      default:
        setFilteredItems(items);
    }
    setFilter(condition);
  };

  //Delete----------------
  const handleDelete = (id) => {
    setItem(items.filter((item) => item.id !== id));
  };

  //Edit----------------
  const [showForm, setShowForm] = useState(false);
  const [inputValue, setInputValue] = useState();
  const [oldValue, setOldValue] = useState();
  const [editId, setEditId] = useState();

  const handleDoubleClick = (id) => {
    setShowForm(true);
    const getInputVal = items.filter((item) => item.id === id)[0].name;
    setInputValue(getInputVal);
    setEditId(id);
    setOldValue(getInputVal);
  };

  const submitEditing = () => {
    setShowForm(false);
  };

  const handleChangeItem = (id, text) => {
    setInputValue(text);
    const index = items.findIndex((item) => item.id === id);
    if (text.trim() === "") {
      const updateditem = { ...items[index], name: oldValue };
      const updatedItems = [
        ...items.slice(0, index),
        updateditem,
        ...items.slice(index + 1),
      ];
      setItem(updatedItems);
      setFilteredItems(updatedItems);
    } else {
      const updateditem = { ...items[index], name: text };
      const updatedItems = [
        ...items.slice(0, index),
        updateditem,
        ...items.slice(index + 1),
      ];
      setItem(updatedItems);
      setFilteredItems(updatedItems);
    }
  };
  //-------------

  const renderItems = ({ item }) => (
    <View style={styles.forGroup}>
      <CheckBox
        value={item.done}
        isChecked={item.done}
        onClick={() => handleCheck(item.id, !item.done)}
      />
      <TouchableOpacity
        onLongPress={() => handleDoubleClick(item.id)}
        delayLongPress={250}
      >
        {showForm && editId === item.id ? (
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={(text) => handleChangeItem(item.id, text)}
            onBlur={() => setShowForm(false)}
            onSubmitEditing={() => submitEditing()}
            autoFocus={true}
          />
        ) : (
          <Text style={item.done ? styles.lineThrough : styles.activeItem}>
            {item.name?.toString()}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        &times;
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.appbar}>
        <Text style={styles.title}>Todo App</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.formControlWrapper}>
          <TextInput
            style={styles.formControl}
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder="Enter Your Task..."
            onSubmitEditing={add}
            autoFocus={true}
          />
        </View>
        <Text style={styles.addBtn} onPress={add}>
          +
        </Text>
      </View>
      <View style={styles.forGroup}>
        <Text style={styles.actionBtn} onPress={() => filterItems("all")}>
          All
        </Text>
        <Text style={styles.actionBtn} onPress={() => filterItems("active")}>
          Active
        </Text>
        <Text style={styles.actionBtn} onPress={() => filterItems("completed")}>
          Completed
        </Text>
      </View>
      <View style={styles.content}>
        <FlatList
          data={filteredItems}
          renderItem={renderItems}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled={true}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.leftItem}>{leftItem} Items Left</Text>
      </View>
      <View style={styles.forGroup}>
        <Text style={styles.actionAllBtn} onPress={checkAll}>
          {leftItem === 0 ? "Uncheck All" : "Check All"}
        </Text>
        <Text style={styles.actionAllBtn} onPress={clearCompleted}>
          Clear Completed
        </Text>
      </View>
    </ScrollView>
  );
};

export default App;
