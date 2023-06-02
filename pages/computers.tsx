import React, { useEffect, useState } from 'react';
import computersData from '../computers.json';
import { serverAddress, devMode } from '../config';
import axios from 'axios';
import Clock from "../components/Clock";
import ComputerCard from '../components/ComputerCard';

interface PingResult {
  ipAddress: string;
  status: 'success' | 'error' | 'pending';
}

interface RdpStatus {
  ipAddress: string;
  rdpStatus: 'success' | 'error' | 'pending';
}

interface WolStatus {
  ipAddress: string;
  wolState: 'idle' | 'waking' | 'woken' | 'wokenError';
}

const Computers = () => {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [rdpStatuses, setRdpStatuses] = useState<RdpStatus[]>([]);
  const [wolStatuses, setWolStatuses] = useState<WolStatus[]>([]);
  const [computers_Data, setComputers_Data] = useState<{ name: string; macAddress: string; ipAddress: string; }[]>([]);

  const updateComputers_Data = (updated_Data: { name: string; macAddress: string; ipAddress: string; }[]) => {
    setComputers_Data(updated_Data);
  };    

  useEffect(() => {
    const pingComputers = async () => {
      for (const computer of computersData) {
        try {
          const response = await fetch(`${serverAddress}/api/ping?ipAddress=${computer.ipAddress}`);
          const data = await response.json();
          if (data.status === 'success') {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            //console.log(`success ${computer.ipAddress}`);
          } else {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            //console.log(`error ${computer.ipAddress}`);
          }
        } catch (error) {
          const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
          setPingResults(prevResults => [...prevResults, updatedResult]);
          console.log(`error ${computer.ipAddress}`);
        }
        await checkRdpStatus(computer.ipAddress);
      }
    };

    pingComputers();
  }, []);

  const pingSelectedComputer = async (ipAddress: string) => {
    if (ipAddress) {
      const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
      if (computer) {
        const updatedResult = { ipAddress: computer.ipAddress, status: 'pending' as const };
        setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
        
        try {
          const response = await fetch(`${serverAddress}/api/ping?ipAddress=${computer.ipAddress}`);
          const data = await response.json();
          
          if (devMode) {
            data.status = getRandom('success', 'error');
            console.log('PING |   ', ipAddress, data.status)
          }
          
          if (data.status === 'success') {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
            setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
            console.log(`PING | success ${computer.ipAddress}`);
            await checkRdpStatus(computer.ipAddress);
            return "success";
          } else {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
            console.log(`PING | error ${computer.ipAddress}`);
            return "error";
          }
        } catch (error) {
          const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
          setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
          console.log(`PING | error ${computer.ipAddress}`);
          return "error";
        }
      }
    }
  };

  const checkRdpStatus = async (ipAddress: string) => {
    try {
      const response = await fetch(`${serverAddress}/api/pingport?ipAddress=${ipAddress}&port=3389`);
      const data = await response.json();
      
      if (devMode) {
        data.status = getRandom('success', 'error');
      }
      
      const updatedStatus = { ipAddress, rdpStatus: data.status };
      
      setRdpStatuses(prevStatuses => {
        const index = prevStatuses.findIndex(status => status.ipAddress === ipAddress);
        
        if (index !== -1) {
          const newStatuses = [...prevStatuses];
          newStatuses[index] = updatedStatus;
          return newStatuses;
        } else {
          return [...prevStatuses, updatedStatus];
        }
      });
      
      console.log("RDP | ", data.status, ipAddress);
      
      return data.status;
    } catch (error) {
      console.log("Error:", error);
    }
  };
  

  function getRandom(...arr: any) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const sendWoL = async (macAddress: string) => {
    let ipAddress = computersData.find(computer => computer.macAddress === macAddress)?.ipAddress;
    if (!ipAddress) {
      console.log(`WOL | Nebola nájdená IP Adresa pre MAC Adresu: ${macAddress}`);
      return;
    }
  
    const existingWolStatus = wolStatuses.find(status => status.ipAddress === ipAddress);
    if (existingWolStatus && existingWolStatus.wolState !== 'idle' && existingWolStatus.wolState !== 'wokenError') {
      console.log(`WOL | WoL už prebieha pre IP Adresu: ${ipAddress}`);
      return;
    }
  
    const updatedWolStatus = { ipAddress, wolState: 'waking' as const };
    setWolStatuses(prevStatuses => [...prevStatuses.filter(status => status.ipAddress !== ipAddress), updatedWolStatus]);
  
    const response = await fetch(`${serverAddress}/api/wol?macAddress=${macAddress}`);
    const data = await response.json();
    console.log('WOL | ', data);
  
    if (data.status === 'success') {
      console.log('WOL | Zobúdzanie...');
      let pingResponse;
      console.log("IP ADRESA", ipAddress);
      const rdpValue = await checkRdpStatus(ipAddress);
      if (rdpValue === "success") {
        setWolStatuses(prevStatuses => {
          const updatedStatuses = prevStatuses.map(status => {
            if (status.ipAddress === ipAddress) {
              console.log("WOL | woken");
              return { ...status, wolState: 'woken' as const };
            }
            return status;
          });
          return updatedStatuses.filter(status => status !== undefined);
        });
      } else {
        if (devMode){
          await new Promise(resolve => setTimeout(resolve, 0.01 * 60 * 1000));
          pingResponse = await fetch(`${serverAddress}/api/ping?ipAddress=127.0.0.1`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
          pingResponse = await fetch(`${serverAddress}/api/ping?ipAddress=${ipAddress}`);
        }
        const pingData = await pingResponse.json();
        if (devMode){
          pingData.status = getRandom('error', 'success');
          console.log("WOL DEV RANDOM | ", pingData.status);
        }
        const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
        if (pingData.status === 'success' && computer) {
          const updatedResult = { ipAddress: ipAddress, status: 'success' as const };
          setPingResults((prevResults) => [...prevResults, updatedResult]);
          console.log(`WOL | success ${computer.ipAddress}`);
          setWolStatuses(prevStatuses => {
            const updatedStatuses = prevStatuses.map(status => {
              if (status.ipAddress === ipAddress) {
              // if (ipAddress === ipAddress) {
                console.log("WOL | woken");
                return { ...status, wolState: 'woken' as const };
              }
              return status;
            });
            return updatedStatuses;
          });
        } else {
          setWolStatuses(prevStatuses => {
            const updatedStatuses = prevStatuses.map(status => {
              if (status.ipAddress === ipAddress) {
                console.log("WOL | wokenError");
                return { ...status, wolState: 'wokenError' as const };
              }
              return status;
            });
            return updatedStatuses;
          });
        }
      }
      

    }
  };

  const deleteComputer = async (macAddress: string) => {
    try {
      await axios.post(`${serverAddress}/api/remove-computer`, { macAddress });
    } catch (error) {
      console.log('RPC | ', error);  
    }
  };

  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<{ ipAddress: string; name: string } | null>(null);

  const handleEditClick = (ipAddress: string, name: string) => {
    setEditMode(true);
    console.log(ipAddress);
    setEditedValues({ ipAddress, name });
  };
  
  const handleSaveClick = () => {
    // Update the computer data with the edited values
    const updatedComputers_Data = computersData.map((computer) => {
      if (computer.ipAddress === editedValues?.ipAddress) {
        return { ...computer, name: editedValues.name };
      }
      return computer;
    });
  
    // Update the computersData state variable
    setComputers_Data(updatedComputers_Data);
  
    // Send the updated data to the server
    fetch(`${serverAddress}/api/edit-computer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ipAddress: editedValues ? editedValues.ipAddress : '', name: editedValues ? editedValues.name : '' }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response if necessary
        console.log('WOL | ', data);
      })
      .catch((error) => {
        // Handle any errors
        console.error(error);
      });
  
    setEditMode(false);
    setEditedValues(null);
  };
  
  function getStatusColorClass(status: 'success' | 'error' | 'pending' | 'idle' | 'waking' | 'woken' | 'wokenError'): string {
    switch (status) {
      case 'success':
      case 'woken':
        return 'text-green-500';
      case 'error':
      case 'wokenError':
        return 'text-red-500';
      case 'pending':
      case 'waking':
        return 'text-yellow-500';
      default:
        return '';
    }
  }
  
  

  return (
        <div>
          <div>
            <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
              {computersData.map((computer, index) => (
                  <ComputerCard
                    key={index}
                    cardKey={index}
                    computer={computer}
                    editMode={editMode}
                    editedValues={editedValues}
                    pingStatus={pingResults.find((result) => result.ipAddress === computer.ipAddress)?.status}
                    rdpStatus={rdpStatuses.find((status) => status.ipAddress === computer.ipAddress)?.rdpStatus}
                    wolState={wolStatuses.find((status) => status.ipAddress === computer.ipAddress)?.wolState}
                    sendWol={() => sendWoL(computer.macAddress)}
                    pingSelectedComputer={() => pingSelectedComputer(computer.ipAddress)}
                    handleEditClick={() => handleEditClick(computer.ipAddress, computer.name)} // Pass the required arguments
                    handleSaveClick={handleSaveClick} // Remove unnecessary arrow function
                    setEditedValues={(values) => setEditedValues(values)} // Pass the required arguments
                    deleteComputer={() => deleteComputer(computer.macAddress)} // Pass the required arguments
                  />
                ))}
              </div>
            </div>
          </div>
      </div>
  );
  
};

export default Computers;
