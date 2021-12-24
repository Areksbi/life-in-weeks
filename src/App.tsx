import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  useWindowSize,
} from '@react-hook/window-size'
import './App.css';

const toDateInputValue = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0,10);
};

const getWeek = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);

  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }

  // @ts-ignore
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function App() {
  const [lifeExpectation, setLifeExpectation] = useState<number>(88);
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [scale, setScale] = useState(0);
  const [windowWidth, windowHeight] = useWindowSize();
  const headerRef = useRef<HTMLElement>(document.createElement('header'));
  const tableRef = useRef<HTMLTableElement>(document.createElement('table'));

  const weeksPerYear = 53;
  const weeksPerYearAsArray = Array.from(Array(weeksPerYear), (_, i: number) => i+1);
  const lifeExpectationAsArray = Array.from(Array(lifeExpectation).keys());

  const today = new Date();
  const todayYear = today.getFullYear();
  const birthdayYear = birthday?.getFullYear() ?? todayYear;
  const years = todayYear - birthdayYear;
  const todayWeek = getWeek(today);
  const birthdayWeek = getWeek(birthday ?? today);
  const weeks = todayWeek - birthdayWeek;

  useEffect(() => {
    const tableHeight = tableRef.current.offsetHeight;
    const tableWidth = tableRef.current.offsetWidth;
    const externalHeight = windowHeight - headerRef.current.offsetHeight;
    const externalWidth = windowWidth;

    setScale(Math.min(
      externalWidth / tableWidth,
      externalHeight / tableHeight
    ));
  }, [birthday, lifeExpectation, windowWidth, windowHeight])

  return (
    <main>
      <header ref={headerRef}>
        <h1>MY LIFE IN WEEKS</h1>
        <label>
          Birthday:
          <input type="date" value={toDateInputValue(birthday)} onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthday(e.target.valueAsDate ?? today)}/>
        </label>
        <label>
          Life expectation:
          <input type="number" value={lifeExpectation} onChange={(e: ChangeEvent<HTMLInputElement>) => setLifeExpectation(e.target.valueAsNumber ?? 0)}/>
        </label>
      </header>

      <table ref={tableRef} style={{transform: `scale(${scale})`}}>
        <thead>
          <tr>
            <td></td>
            {
              weeksPerYearAsArray.map((week: number, j: number) => (
                <th key={j} scope={'col'}>
                  {
                    (week === 1) || (week % 5 === 0) ? week : ''
                  }
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            lifeExpectationAsArray.map((year: number, i: number) => (
              <tr key={i}>
                <th scope={'row'}>
                  {
                    (year === 0) || (year % 5 === 0) ? year : ''
                  }
                </th>
                {
                  weeksPerYearAsArray.map((week: number, j: number) => (
                    <td key={j}>
                      <input type="checkbox" readOnly checked={(year < years) || (year === years && week <= weeks)}/>
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    </main>
  );
  // return (
  //   <main>
  //     <header ref={headerRef}>
  //       <h1>5K WEEKS</h1>
  //       <label>
  //         Add your birth date:
  //         <input type="date" value={toDateInputValue(birthday)} onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthday(e.target.valueAsDate ?? today)}/>
  //       </label>
  //       <label>
  //         Add your life expectation:
  //         <input type="number" value={lifeExpectation} onChange={(e: ChangeEvent<HTMLInputElement>) => setLifeExpectation(e.target.valueAsNumber ?? 0)}/>
  //       </label>
  //     </header>
  //
  //     <table ref={tableRef} style={{transform: `scale(${scale})`}}>
  //       <thead>
  //         <tr>
  //           <td></td>
  //           {
  //             lifeExpectationAsArray.map((year: number, i: number) => (
  //               <th key={i} scope={'col'}>
  //                 {
  //                   (year === 0) || (year % 5 === 0) ? year : ''
  //                 }
  //               </th>
  //             ))
  //           }
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {
  //           weeksPerYearAsArray.map((week: number, i: number) => (
  //             <tr key={i}>
  //               <th scope={'row'}>
  //                 {
  //                   (week === 1) || (week % 5 === 0) ? week : ''
  //                 }
  //               </th>
  //               {
  //                 lifeExpectationAsArray.map((year: number, j: number) => (
  //                   <td key={j}>
  //                     <input type="checkbox" readOnly checked={(year < years) || (year === years && week <= weeks)}/>
  //                   </td>
  //                 ))
  //               }
  //             </tr>
  //           ))
  //         }
  //       </tbody>
  //     </table>
  //   </main>
  // );
}

export default App;
