import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Define custom icons for robot markers
const onlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  iconSize: [25, 25],
});

const offlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/103/103085.png",
  iconSize: [25, 25],
});

const lowBatteryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565313.png",
  iconSize: [25, 25],
});

function App() {
  const [robots, setRobots] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newRobot, setNewRobot] = useState({
    id: "",
    online: true,
    battery: 100,
    cpu_usage: 0,
    ram_consumption: 0,
    location: [0, 0],
  });
  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await axios.get("http://localhost:8000/robots");
        setRobots(response.data.robots);
      } catch (error) {
        console.error("Error fetching robot data:", error);
      }
    };
    fetchRobots();
    const interval = setInterval(fetchRobots, 5000);
    return () => clearInterval(interval);
  }, []);
  const handleAddRobot = async () => {
    try {
      await axios.post("http://localhost:8000/robots", newRobot);
      alert("Robot added successfully!");
    } catch (error) {
      console.error("Error adding robot:", error);
      alert("Failed to add robot. Please try again.");
    }
  };
  const handleDeleteRobot = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/robots/${id}`);
      alert(`Robot ${id} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting robot:", error);
      alert("Failed to delete robot. Please try again.");
    }
  };
  const filteredRobots = robots.filter((robot) => {
    if (filter === "online") return robot.online;
    if (filter === "offline") return !robot.online;
    if (filter === "low_battery") return robot.battery < 20;
    return true; 
  });

  return (
    <div>
      <h1>Robot Fleet Monitoring Dashboard</h1>

      {/* Map */}
      <div style={{ height: "400px", width: "100%" }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "400px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredRobots.map((robot) => (
            <Marker
              key={robot.id}
              position={robot.location}
              icon={
                robot.battery < 20
                  ? lowBatteryIcon
                  : robot.online
                  ? onlineIcon
                  : offlineIcon
              }
            >
              <Popup>
                <strong>ID:</strong> {robot.id} <br />
                <strong>Status:</strong> {robot.online ? "Online" : "Offline"}{" "}
                <br />
                <strong>Battery:</strong> {robot.battery}% <br />
                <strong>CPU:</strong> {robot.cpu_usage}% <br />
                <strong>RAM:</strong> {robot.ram_consumption} MB
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Filters */}
      <div>
        <h2>Filters</h2>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("online")}>Online</button>
        <button onClick={() => setFilter("offline")}>Offline</button>
        <button onClick={() => setFilter("low_battery")}>Low Battery</button>
      </div>

      {/* Add Robot */}
      <div>
        <h2>Add New Robot</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddRobot();
          }}
        >
          <label>
            ID:
            <input
              type="text"
              value={newRobot.id}
              onChange={(e) => setNewRobot({ ...newRobot, id: e.target.value })}
              required
            />
          </label>
          <label>
            Online:
            <input
              type="checkbox"
              checked={newRobot.online}
              onChange={(e) =>
                setNewRobot({ ...newRobot, online: e.target.checked })
              }
            />
          </label>
          <label>
            Battery:
            <input
              type="number"
              value={newRobot.battery}
              onChange={(e) =>
                setNewRobot({ ...newRobot, battery: Number(e.target.value) })
              }
              required
            />
          </label>
          <label>
            Location (lat, lng):
            <input
              type="text"
              placeholder="latitude"
              onChange={(e) =>
                setNewRobot({
                  ...newRobot,
                  location: [
                    Number(e.target.value),
                    newRobot.location[1],
                  ],
                })
              }
              required
            />
            <input
              type="text"
              placeholder="longitude"
              onChange={(e) =>
                setNewRobot({
                  ...newRobot,
                  location: [
                    newRobot.location[0],
                    Number(e.target.value),
                  ],
                })
              }
              required
            />
          </label>
          <button type="submit">Add Robot</button>
        </form>
      </div>

      {/* Robot List */}
      <div>
        <h2>Robot List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Battery</th>
              <th>CPU</th>
              <th>RAM</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRobots.map((robot) => (
              <tr
                key={robot.id}
                style={{
                  backgroundColor: robot.battery < 20 ? "red" : "",
                }}
              >
                <td>{robot.id}</td>
                <td>{robot.online ? "Online" : "Offline"}</td>
                <td>{robot.battery}%</td>
                <td>{robot.cpu_usage}%</td>
                <td>{robot.ram_consumption} MB</td>
                <td>{robot.last_updated}</td>
                <td>
                  <button onClick={() => handleDeleteRobot(robot.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default App;
