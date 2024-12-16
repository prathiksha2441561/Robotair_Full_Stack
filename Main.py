from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
import random
import asyncio
import datetime
app=FastAPI()
robots=[
 {
  "id":f"robot-{i}",
  "online":random.choice([True, False]),
  "battery":random.randint(10, 100),
  "cpu_usage":random.randint(10, 90),
  "ram_consumption":random.randint(100, 1000),
  "last_updated":datetime.datetime.now().isoformat(),
  "location":[random.uniform(-90, 90), random.uniform(-180, 180)],
 } 
 for i in range(10)
]
class Robot(BaseModel):
id:str
online:bool
battery:int
cpu_usage:int
ram_consumption:int
location:list
@app.get("/robots")
async def get_robots():"""Get all robot data."""
 return {"robots":robots}
@app.get("/robots/filter")
async def filter_robots(status:str=None):"""Filter robots based on status."""
if status=="online":
 filtered_robots=[robot for robot in robots if robot["online"]]
elif status=="offline":
 filtered_robots=[robot for robot in robots if not robot["online"]]
elif status=="low_battery":
 filtered_robots=[robot for robot in robots if robot["battery"]<20]
else:filtered_robots=robots
 return{"robots:filtered_robots}
@app.post("/robots")
async def add_robot(robot:Robot):"""Add a new robot."""
 for existing_robot in robots:if existing_robot["id"]==robot.id:raise HTTPException(status_code=400, detail="Robot ID already exists.")
  new_robot=robot.dict()
  new_robot["last_updated"]=datetime.datetime.now().isoformat()
  robots.append(new_robot)
  return{"message":"Robot added successfully","robot":new_robot}
@app.delete("/robots/{robot_id}")
async def delete_robot(robot_id:str):"""Delete a robot by ID."""
 global robots
 robots=[robot for robot in robots if robot["id"]!=robot_id]
  return{"message":f"Robot{robot_id}deleted successfully."}
@app.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):"""WebSocket for real-time updates."""
await websocket.accept()
update_interval=5  # Default update interval in seconds
while True:
 for robot in robots:
  robot["battery"]=max(0, robot["battery"]-random.randint(0, 5))
  robot["cpu_usage"]=random.randint(10, 90)
  robot["ram_consumption"]=random.randint(100, 1000)
  robot["last_updated"]=datetime.datetime.now().isoformat()
  robot["location"]=
  [
   robot["location"][0]+random.uniform(-0.01, 0.01),
   robot["location"][1]+random.uniform(-0.01, 0.01),
  ]
  await websocket.send_json({"robots":robots})
  await asyncio.sleep(update_interval)
if __name__=="__main__":import uvicorn
 uvicorn.run(app, host="0.0.0.0", port=8000)