import { useState } from "react";
import "./App.css";
import moment from "moment";

const PARKING_SLOTS = {
  small: {
    label: "SP",
    value: 10
  },
  medium: {
    label: "MP",
    value: 20
  },
  large: {
    label: "LP",
    value: 30
  }
};

const VEHICLE_TYPES = {
  small: {
    label: "Small Vihicle",
    value: 10
  },
  medium: {
    label: "Medium Vihicle",
    value: 20
  },
  large: {
    label: "Large Vihicle",
    value: 30
  }
};

const PARKING_FEES = {
  flatRate: 40,
  hourlyRates: {
    SP: 20,
    MP: 60,
    LP: 100
  },
  flatRateExceeding24Hours: 5000
};

function App() {
  const [parkingSpaceData, setParkingSpaceData] = useState([
    {
      id: 1,
      distances: [1, 3, 5],
      available: true,
      parkingType: PARKING_SLOTS.small,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 2,
      distances: [2, 4, 4],
      available: true,
      parkingType: PARKING_SLOTS.small,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 3,
      distances: [3, 5, 3],
      available: true,
      parkingType: PARKING_SLOTS.small,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 4,
      distances: [2, 2, 4],
      available: true,
      parkingType: PARKING_SLOTS.medium,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 5,
      distances: [3, 3, 3],
      available: true,
      parkingType: PARKING_SLOTS.small,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 6,
      distances: [4, 4, 2],
      available: true,
      parkingType: PARKING_SLOTS.medium,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 7,
      distances: [3, 1, 3],
      available: true,
      parkingType: PARKING_SLOTS.large,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 8,
      distances: [4, 2, 2],
      available: true,
      parkingType: PARKING_SLOTS.medium,
      timeStart: "",
      vehicleDetails: {}
    },
    {
      id: 9,
      distances: [5, 3, 1],
      available: true,
      parkingType: PARKING_SLOTS.large,
      timeStart: "",
      vehicleDetails: {
        label: "",
        value: 0,
        plateNumber: ""
      }
    }
  ]);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [parkData, setParkData] = useState({
    entryPoint: 0,
    plateNumber: "",
    vehicleType: {
      label: "Small Vehicle",
      value: 0
    }
  });
  const [receipt, setReceipt] = useState({
    totalFee: 0,
    totalHours: 0,
    exceedingHours: 0,
    timeStart: "",
    timeEnd: ""
  });
  const [unParkData, setUnParkData] = useState({
    plateNumber: ""
  });

  const park = (entryPoint, vehicleType, plateNumber) => {
    if (!plateNumber) {
      return alert("Plate Number is required");
    }
    if (!entryPoint) {
      return alert("Entry Point is required");
    }
    if (!vehicleType.value) {
      return alert("Vehicle Type is required");
    }
    const checkPlateNumberExist = parkingSpaceData.filter(
      (parkingSpace) => parkingSpace.vehicleDetails.plateNumber === plateNumber
    );

    if (checkPlateNumberExist.length) {
      return alert("Plate Number is already exist");
    }
    const checkHistory = parkingHistory.find(
      (history) => history.plateNumber === plateNumber
    );

    let timeStart = moment().format();
    if (checkHistory) {
      const duration = moment.duration(moment().diff(checkHistory.timeStart));
      const totalHours = duration.asHours();
      if (totalHours < 1) {
        timeStart = checkHistory.timeStart;
      }
    }

    let availableParkingSpace = parkingSpaceData.filter(
      (parkingSpace) => parkingSpace.available
    );
    if (
      vehicleType.value !== VEHICLE_TYPES.small.value &&
      vehicleType.value !== VEHICLE_TYPES.medium.value
    ) {
      availableParkingSpace = availableParkingSpace.filter(
        (parkingSpace) => parkingSpace.parkingType.value === vehicleType.value
      );
    }
    if (vehicleType.value === VEHICLE_TYPES.small.value) {
      const checkSmallParkingSpace = availableParkingSpace.some(
        (parkingSpace) => parkingSpace.parkingType.value === vehicleType.value
      );
      if (checkSmallParkingSpace) {
        availableParkingSpace = availableParkingSpace.filter(
          (parkingSpace) => parkingSpace.parkingType.value === vehicleType.value
        );
      }
    }
    if (vehicleType.value === VEHICLE_TYPES.medium.value) {
      const checkMediumlParkingSpace = availableParkingSpace.some(
        (parkingSpace) => parkingSpace.parkingType.value === vehicleType.value
      );
      availableParkingSpace = availableParkingSpace.filter(
        (parkingSpace) =>
          parkingSpace.parkingType.value !== VEHICLE_TYPES.small.value
      );
      if (checkMediumlParkingSpace) {
        availableParkingSpace = availableParkingSpace.filter(
          (parkingSpace) => parkingSpace.parkingType.value === vehicleType.value
        );
      }
    }

    const closestDistance = availableParkingSpace.reduce(
      (minObject, currentObject) => {
        const currentValue = currentObject.distances[entryPoint - 1];

        if (currentValue < minObject.distances[entryPoint - 1]) {
          return currentObject;
        }
        return minObject;
      },
      availableParkingSpace[0]
    );

    if (closestDistance) {
      setParkingSpaceData((prevState) =>
        prevState.map((space) =>
          space.id === closestDistance.id
            ? {
                ...space,
                available: false,
                timeStart,
                vehicleDetails: { ...vehicleType, plateNumber }
              }
            : space
        )
      );
    }
  };
  const unpark = (plateNumber) => {
    if (!plateNumber) {
      return alert("Plate Number is required");
    }
    let totalFee = PARKING_FEES.flatRate;
    const currentParkingSpace = parkingSpaceData.find(
      (parkingSpace) => parkingSpace.vehicleDetails.plateNumber === plateNumber
    );
    if (!currentParkingSpace) {
      return alert("No Parked Vehicle");
    }
    const parkingTypeLabel = currentParkingSpace?.parkingType?.label;
    const timeStart = currentParkingSpace?.timeStart;
    // const duration = moment.duration(moment().add(48, "hours").diff(timeStart));
    const duration = moment.duration(moment().diff(timeStart));
    const totalHours = Math.round(duration.asHours());
    let exceeding = 0;
    if (totalHours > 3 && totalHours < 24) {
      exceeding = totalHours - 3;
      totalFee =
        totalFee + exceeding * PARKING_FEES.hourlyRates[parkingTypeLabel];
    }
    if (totalHours > 24) {
      const days = totalHours / 24;
      exceeding = totalHours - 3;
      totalFee = 5000 * days;
      console.log(days);
    }
    setReceipt({
      totalFee,
      totalHours,
      exceedingHours: exceeding,
      timeStart: timeStart,
      timeEnd: moment().format()
    });
    setParkingHistory([
      ...parkingHistory,
      {
        plateNumber: currentParkingSpace?.vehicleDetails?.plateNumber,
        timeStart: currentParkingSpace?.timeStart,
        timeEnd: moment().format()
      }
    ]);
    setParkingSpaceData((prevState) =>
      prevState.map((space) =>
        space.vehicleDetails.plateNumber === plateNumber
          ? {
              ...space,
              available: true,
              timeStart: "",
              vehicleDetails: {}
            }
          : space
      )
    );
  };

  const handleOnChangePark = (e) => {
    let value = e.target.value;
    if (e.target.name === "entryPoint") {
      value = parseInt(value);
    }
    if (e.target.name === "vehicleType") {
      for (var key of Object.keys(VEHICLE_TYPES)) {
        if (parseInt(value) === VEHICLE_TYPES[key].value) {
          value = {
            label: VEHICLE_TYPES[key].label,
            value: VEHICLE_TYPES[key].value
          };
        }
      }
    }
    setParkData({ ...parkData, [e.target.name]: value });
  };
  const handleOnChangeUnPark = (e) => {
    let value = e.target.value;

    setUnParkData({ ...parkData, [e.target.name]: value });
  };

  return (
    <div className="App">
      <div className="">
        <div className="flex gap-6">
          <select
            onChange={handleOnChangePark}
            name="entryPoint"
            id="entryPoint"
            value={parkData.entryPoint}
          >
            <option value={0} disabled>
              Select Entry Point
            </option>
            <option value={1}>Entry Point 1</option>
            <option value={2}>Entry Point 2</option>
            <option value={3}>Entry Point 3</option>
          </select>
          <select
            onChange={handleOnChangePark}
            name="vehicleType"
            id="vehicleType"
            value={parkData.vehicleType.value}
          >
            <option value={0} disabled>
              Select Vehicle Type
            </option>
            <option value={10}>Small</option>
            <option value={20}>Medium</option>
            <option value={30}>Large</option>
          </select>
          <input
            onChange={handleOnChangePark}
            className="border border-1"
            placeholder="Plate number"
            name="plateNumber"
            value={parkData.plateNumber}
          />
          <button
            className="border  py-2 px-6 bg-green-600"
            onClick={() => {
              park(
                parkData.entryPoint,
                parkData.vehicleType,
                parkData.plateNumber
              );
              setParkData({
                entryPoint: 0,
                plateNumber: "",
                vehicleType: {
                  label: "Small Vehicle",
                  value: 0
                }
              });
            }}
          >
            park
          </button>
        </div>
        <div className="m-6">
          <input
            onChange={handleOnChangeUnPark}
            className="border border-1 p-2"
            placeholder="Plate number"
            name="plateNumber"
            value={unParkData.plateNumber}
          />
          <button
            className="border  py-2 px-6 bg-red-600"
            onClick={(e) => {
              unpark(unParkData.plateNumber);
              setUnParkData({ plateNumber: "" });
            }}
          >
            unpark
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-8 m-12 ">
        {parkingSpaceData.map((parkingSpace, index) => {
          return (
            <div
              key={index}
              className={`border border-1 border-black h-[200px] w-[200px] flex items-center p-4 text-sm ${
                parkingSpace.available ? "bg-green-600" : "bg-red-600"
              }`}
            >
              <div>
                <div>{`Distance: (${parkingSpace?.distances})`}</div>
                <div>
                  {" "}
                  {`ParkingType: (${parkingSpace?.parkingType?.label || ""})`}
                </div>
                <div>
                  {`Vehicle Type:${parkingSpace.vehicleDetails?.label || ""}`}{" "}
                </div>
                <div> {`Slot:${parkingSpace.id}`} </div>
                <div>
                  {`Plate Number:${
                    parkingSpace.vehicleDetails.plateNumber || ""
                  } `}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <h1 className="font-bold">Receipt</h1>
        <div>
          Time Start:
          {receipt.timeStart &&
            moment(receipt.timeStart).format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </div>
        <div>
          Time End:
          {receipt.timeEnd &&
            moment(receipt.timeEnd).format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </div>
        <h1>Total Hours: {receipt.totalHours}</h1>
        <h1>Exceeding Hours: {receipt.exceedingHours}</h1>
        <h1>Total Fee: {receipt.totalFee}</h1>
      </div>
      <div className="mt-20">
        <div className="font-bold">PARKING HISTORY</div>
        {parkingHistory.map((history, index) => {
          return (
            <div key={index} className="mb-5">
              <div>PlateNumber: {history.plateNumber}</div>
              <div>
                Time Start:{" "}
                {history.timeStart &&
                  moment(history.timeStart).format(
                    "dddd, MMMM Do YYYY, h:mm:ss a"
                  )}
              </div>
              <div>
                Time out:
                {history.timeEnd &&
                  moment(history.timeEnd).format(
                    "dddd, MMMM Do YYYY, h:mm:ss a"
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
