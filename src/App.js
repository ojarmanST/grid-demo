import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const App = () => {
  //  recommend the use of memo around Components, to avoid wasted component renders on your Component.
 const gridRef = useRef(); // Optional - for accessing Grid's API
 const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row

 const [includeMedals, setIncludeMedals] = useState(true)
 const [capHeaders, setCapHeaders] = useState(false)

 // Each Column Definition results in one Column.
 // when making column definition changes, code easier to understand using useMemo
 const columnDefs = useMemo(() => {
    return [
      {
        // field: 'athlete',
        colId: 'bananas',
        // when using valueGetter instead of field, the column will be set a new id on each render
        valueGetter: p => p.data.athlete, 
        initialWidth: 100, 
        headerName: capHeaders ? 'ATHLETE' : 'Athlete'
      },
      {field: 'age', initialWidth: 100, headerName: capHeaders ? 'AGE' : 'Age'},
      {field: 'country'},
      {field: 'year'},
      {field: 'date'},
      {field: 'sport'},
      {field: 'gold', hide: !includeMedals},
      {field: 'silver', hide: !includeMedals},
      {field: 'bronze', hide: !includeMedals},
      {field: 'total', hide: !includeMedals},
    ] 
}, [includeMedals, capHeaders]);

 // DefaultColDef sets props common to all Columns
 // useMemo used here to prevent re-rendering unnecessarily
 const defaultColDef = useMemo(()=> ({
     sortable: true,
     resizable: true
   }));

 // Example of consuming Grid Event
 const cellClickedListener = useCallback( event => {
   console.log('cellClicked', event);
 }, []);

 const toggleMedals = useCallback(() => {
  setIncludeMedals(prev => !prev)
 }, [])

 const toggleHeaders = useCallback(() => {
  setCapHeaders(prev => !prev)
 }, [])

 // Example load data from server
 useEffect(() => {
   fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
   .then(result => result.json())
   .then(rowData => {setRowData(rowData)});
 }, []);

 // Example using Grid's API
 const buttonListener = useCallback( e => {
   gridRef.current.api.deselectAll();
 }, []);



 return (
   <div style={{margin: '50px'}}>
     <button onClick={buttonListener}>Deselect all</button><br></br>
     <button onClick={toggleMedals}>Toggle Medals</button>
     <button onClick={toggleHeaders}>ToggleHeaders</button>
     {/* On div wrapping Grid a) specify theme CSS Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{width: '100%', height: 500}}>
        <AgGridReact 
            ref={gridRef} // Ref for accessing Grid's API 
            rowSelection='multiple' // Optional - allows click selection of rows
            rowData={rowData} // Row Data for Rows
            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties
            animateRows={true} // Optional - set to 'true' to have rows animate when sorted 
            onCellClicked={cellClickedListener} // Optional - registering for Grid Event
            pivotable //
            onGridReady={() => console.log('hello')}
            editable={true}
            sidebar={true}
            pagination={true}
            />
      </div>
   </div>
 );
};

export default App;