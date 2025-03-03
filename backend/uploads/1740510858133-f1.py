import serial
import csv
import time

# Use the correct serial port
ser = serial.Serial('COM4', 115200, timeout=1)  
time.sleep(2)  # Allow connection to establish

# Open CSV file for writing
with open("esp32_ir_data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Timestamp", "IR Sensor Status"])  # CSV Header

    print("Listening for ESP32 IR sensor data...")

    while True:
        try:
            line = ser.readline().decode(errors='ignore').strip()  # Read serial data
            if line:  # Check if line is not empty
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                ir_status = "Fire Detected" if line == "Fire Detected" else "No Fire Detected"
                writer.writerow([timestamp, ir_status])  # Save IR status
                file.flush()
                print(f"Logged: {timestamp}, IR Status: {ir_status}")

        except KeyboardInterrupt:
            print("\nStopped by user.")
            break

ser.close()
