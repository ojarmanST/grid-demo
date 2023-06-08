import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import 'ag-grid-enterprise'
const App = () => {
  //  recommend the use of memo around Components, to avoid wasted component renders on your Component.
 const gridRef = useRef(); // Optional - for accessing Grid's API
 const savedColState = useRef()
 const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
 const [includeMedals, setIncludeMedals] = useState(true)
 const [capHeaders, setCapHeaders] = useState(false)
 const [agePinned, setAgePinned] = useState(undefined)


 // Each Column Definition results in one Column.
 // when making column definition changes, code easier to understand using useMemo
 const columnDefs = useMemo(() => {
    return [
      {
        field: 'athlete',
        // colId: 'bananas',
        // when using valueGetter instead of field, the column will be set a new id on each render
        //if using a value getter, make sure you provide colId, otherwise the grid wont know how to match the columns
        valueGetter: p => p.data.athlete, 
        initialWidth: 200, 
        headerName: capHeaders ? 'ATHLETE' : 'Athlete',
        rowDrag: true
      },
      {
        field: 'age', 
        initialWidth: 100, 
        pinned: agePinned, 
        headerName: capHeaders ? 'AGE' : 'Age',
      },
      {field: 'country'},
      {field: 'year'},
      {field: 'date'},
      {field: 'sport'},
      {field: 'gold', hide: !includeMedals},
      {field: 'silver', hide: !includeMedals},
      {field: 'bronze', hide: !includeMedals},
      {field: 'total', hide: !includeMedals},
    ] 
}, [includeMedals, capHeaders, agePinned]);

 // DefaultColDef sets props common to all Columns
 // useMemo used here to prevent re-rendering unnecessarily
 const defaultColDef = useMemo(()=> ({
     sortable: true,
     resizable: true,
   }));


  const onSaveColState = useCallback(() => {
    const colState = gridRef.current.columnApi.getColumnState()
    console.log('Saving Column State', colState)
    savedColState.current = colState;
    //when you 'save state' you can see all state properties on column in console
    }, [])

  const onRestoreColState = useCallback(() => {
    console.log('Restoring Column State', savedColState.current)
    gridRef.current.columnApi.applyColumnState({state: savedColState.current})
  }, [])

  const onWidth100 = useCallback(() => {
    gridRef.current.columnApi.applyColumnState({
      state: [
        { colId: 'athlete', width: 100 },
      ],
      defaultState: {
        width: 150
      }
    })
  }, [])

  const onSortGoldSilverBronze = useCallback(() => {
    gridRef.current.columnApi.applyColumnState({
      state: [
        { colId: 'gold', sort: 'desc', sortIndex: 0 },
        { colId: 'silver', sort: 'desc', sortIndex: 1 },
        { colId: 'bronze', sort: 'desc', sortIndex:  2},
      ],
      defaultState: {
        sort: null
      }
    })
  }, [])



 // Example of consuming Grid Event
 const cellClickedListener = useCallback( event => {
   console.log('cellClicked', event);
 }, []);

//  const onAgePinned = useCallback( event => {
//    setAgePinned(event.target.value)
//  }, []);

 const toggleMedals = useCallback(() => {
  setIncludeMedals(prev => !prev)
 }, [])

 const toggleHeaders = useCallback(() => {
  setCapHeaders(prev => !prev)
 }, [])

 const onColsMedalsFirst = useCallback(() => {
  gridRef.current.columnApi.applyColumnState(
    {
      state: [
        {colId: 'gold', editable: true}, 
        {colId: 'silver'}, 
        {colId: 'bronze'}, 
        {colId: 'total'}, 
        {colId: 'athlete'}, 
        {colId: 'age'}, 
        {colId: 'country'}, 
      ],
      applyOrder: true
    })
 }, [])

 const onColsMedalsLast = useCallback(() => {
  gridRef.current.columnApi.applyColumnState(
    {
      state: [
        {colId: 'athlete'}, 
        {colId: 'age'}, 
        {colId: 'country'}, 
        {colId: 'gold'}, 
        {colId: 'silver'}, 
        {colId: 'bronze'}, 
        {colId: 'total'}, 
      ],
      applyOrder: true
    })
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

 const onGrouping = useCallback( () => {
  console.log(gridRef.current.columnApi)
    gridRef.current.columnApi.applyColumnState(
      {
        state: [
          {colId: 'athlete', rowGroupIndex: 1, hide: true}, 
          {colId: 'country', rowGroupIndex: 0, hide: true}, 
          {colId: 'gold', aggFunc: 'sum'}, 
          {colId: 'silver', aggFunc: 'sum'}, 
          {colId: 'bronze', aggFunc: 'sum'}, 
          {colId: 'total', aggFunc: 'sum'}, 
        ],
        applyOrder: true
      }
    )
 }, [])


 return (
   <div style={{margin: '50px'}}>
     <button onClick={buttonListener}>Deselect all</button><br></br>
     <button onClick={toggleMedals}>Toggle Medals</button>
     <button onClick={toggleHeaders}>ToggleHeaders</button><br></br>

     Set Age Pinned: 
     <button onClick={() =>setAgePinned('left')}>Left</button>
     <button onClick={() =>setAgePinned('right')}>Right</button>
     {/* setting state value to null means to 'clear' it while undefined means, don't touch it */}
     <button onClick={() =>setAgePinned(null)}>Null</button>
     <button onClick={() =>setAgePinned(undefined)}>Undefined</button><br></br>

     Column State:
     <button onClick={onSaveColState}>Save State</button>
     <button onClick={onRestoreColState}>Restore State</button><br></br>
     <button onClick={onWidth100}>Width100</button><br></br>

     <button onClick={onSortGoldSilverBronze}>Sort Medalists by Color</button><br></br>
     <button onClick={onColsMedalsLast}>Medals LAST</button><br></br>
     <button onClick={onColsMedalsFirst}>Medals FIRST</button><br></br>
     <button onClick={onGrouping}>Group Country Athlete</button><br></br>



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
            // pagination={true}
            rowDragManaged={true} // only works if pagination is NOT true
            maintainColumnOrder={true} // if you dont want column order to be changed when setting column definitions, 
            />
      </div>
   </div>
 );
};

export default App;