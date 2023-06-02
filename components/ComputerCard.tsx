import React from 'react';

interface ComputerCardProps {
  cardKey: number;
  computer: {
    name: string;
    macAddress: string;
    ipAddress: string;
  };
  editMode: boolean;
  editedValues: {
    name: string;
    ipAddress: string;
  };
  pingStatus?: 'success' | 'error' | 'pending';
  rdpStatus?: 'success' | 'error' | 'pending';
  wolState?: 'idle' | 'waking' | 'woken' | 'wokenError';
  sendWol: () => void;
  pingSelectedComputer: () => void;
  handleSaveClick: () => void;
  handleEditClick: () => void;
  setEditedValues: React.Dispatch<
    React.SetStateAction<{ name: string; ipAddress: string }>
  >;
  deleteComputer: () => void;
}

const ComputerCard: React.FC<ComputerCardProps> = ({
  cardKey,
  computer,
  editMode,
  editedValues,
  pingStatus,
  rdpStatus,
  wolState,
  sendWol,
  pingSelectedComputer,
  handleSaveClick,
  handleEditClick,
  setEditedValues,
  deleteComputer,
}) => {
  return (
    <div
    key={cardKey}
    className={`bg-gray-200 p-4 rounded-lg shadow-md relative flex flex-col justify-between`}
    data-testid="computer-item"
    >
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {editMode && editedValues?.ipAddress === computer.ipAddress ? (
        <input
            type="text"
            value={editedValues?.name || ''}
            name="name_input"
            onChange={(e) => setEditedValues((prevValues) => ({ ...prevValues, name: e.target.value, ipAddress: prevValues?.ipAddress || '' }))}
            className="border border-gray-300 rounded-lg p-1"
        />
        ) : (
        <h3 className="text-lg font-semibold" id="name">{computer.name.substring(0,20)}</h3>
        )}

        {/* <p className="mt-2"><i className="fas fa-desktop"></i> MAC Adresa: {computer.macAddress}</p> */}
        <p><i className="fas fa-globe"></i> {computer.ipAddress}</p>

        {/*
        (devMode) ? (
        <div>
            <p className={getStatusColorClass(status)}>Status {status}</p>
            <p className={getStatusColorClass(rdpState)}>RDP Status {rdpState}</p>
            <p className={getStatusColorClass(wolState)}>WOL Status {wolState}</p>
        </div>
        ) : null
        */}

        {(pingStatus == 'pending') ? (
        <div className="flex items-center" id="pinging">
            <div className="relative inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent">
            <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                Pingovanie
            </span>
            </div>
            <span className="ml-2">Pingovanie</span>
        </div>
        )
        : (pingStatus === 'success' || rdpStatus === 'success' && wolState !== 'wokenError') || wolState === 'woken' ? (
        <div className="flex justify-between">
            <p className="text-green-600"><i className="fa-solid fa-plug"></i> Online</p>
            {rdpStatus === 'success' ? (
            <p className="text-green-600"><i className="fa-solid fa-circle-check"></i> RDP</p>
            ) : (
            <p className="text-red-600"><i className="fa-solid fa-circle-xmark"></i> RDP</p>
            )}
        </div>
        ) : pingStatus === 'error' ? (
        <div className='flex justify-between'>
            <p className="text-red-600"><i className="fa-solid fa-power-off"></i> Offline</p>
            <p className="text-red-600"><i className="fa-solid fa-circle-xmark"></i> RDP</p>
        </div>
        ) : null}

        {wolState === 'waking' ? (
        <div className="flex items-center" id="waking">
            <div className="relative inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-yellow-500 border-r-transparent">
            <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                Zobúdzanie
            </span>
            </div>
            <span className="ml-2 text-yellow-500">Zobúdzanie</span>
        </div>  
        ) : wolState === 'woken' ? (
        <p className="text-green-500">Zobudený</p>
        ) : wolState === 'wokenError' ? (
        <p className="text-red-500">Počítač sa nepodarilo zobudiť</p>
        ) : (
        <p className="text-gray-500">ㅤ</p>
        )}

        <div className="absolute top-0 right-0 mt-2 mr-2 space-x-2" data-testid="action_buttons">
        {!((pingStatus === 'success' || rdpStatus === 'success' && wolState !== 'wokenError') || wolState === 'woken') ? (
            <button
            type="button"
            rel="tooltip"
            className="btn btn-danger btn-round"
            name="wake"
            onClick={() => sendWol()}
        >
            <i className="fa-regular fa-bell"></i>
        </button>
        ) : null}
        <button
            type="button"
            rel="tooltip"
            className="btn btn-info btn-round"
            name="refresh"
            onClick={() => {
            pingSelectedComputer();
            }}
        >
            <i className="fa-solid fa-arrows-rotate"></i>
        </button>
        {editMode && editedValues?.ipAddress === computer.ipAddress ? (
            <button
            type="button"
            rel="tooltip"
            className="btn btn-secondary btn-round"
            name="save"
            onClick={() => handleSaveClick()}
        >
            <i className="fa-sharp fa-solid fa-save"></i>
        </button>

        ) : (         
        <button
        type="button"
        rel="tooltip"
        className="btn btn-secondary btn-round"
        name="edit"
       onClick={() => handleEditClick()}
        >
        <i className="fa-sharp fa-solid fa-pencil"></i>
        </button>
        )}
        <button
            type="button"
            rel="tooltip"
            className="btn btn-danger btn-round"
            name="remove"
            onClick={() => deleteComputer()}
        >
            <i className="fa-sharp fa-solid fa-trash"></i>
        </button>
        </div>
    </div>
  );
};

export default ComputerCard;
