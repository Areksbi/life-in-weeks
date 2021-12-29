import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  useWindowSize,
} from '@react-hook/window-size'
import './App.css';

const classNames = (classes: {[key: string]: string}) =>
  Object.entries(classes)
    .filter(([key, value]) => value)
    .map(([key, value]) => key)
    .join(' ')

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

const getColorByAge = (age: number) => {
  switch (true) {
    case age < 1:
      return '#ff6961';
    case age === 1:
      return '#fdfd96';
    case age >= 2 && age <= 6:
      return '#77dd77';
    case age > 6 && age <= 11:
      return '#aec6cf';
    case age > 11 && age <= 18:
      return '#ffd1dc';
    case age > 18 && age <= 39:
      return '#b19cd9';
    case age > 39 && age <= 65:
      return '#ffb347';
    case age > 65:
      return '#836953';
    default:
      return '#000000'
  }
}

const App = () => {
  const [lifeExpectation, setLifeExpectation] = useState<number>(88);
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [scale, setScale] = useState(0);
  const [windowWidth, windowHeight] = useWindowSize();
  const [isVerticalScreen, setIsVerticalScreen] = useState<boolean>(windowHeight > windowWidth);
  const headerRef = useRef<HTMLElement>(document.createElement('header'));
  const tableRef = useRef<HTMLTableElement>(document.createElement('table'));

  const additionalColumns = 2;
  const weeksPerYear = 52;
  const additionalColumnsArray = Array.from(Array(additionalColumns).keys());
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
    setIsVerticalScreen(windowHeight > windowWidth);
  }, [windowHeight, windowWidth])

  useEffect(() => {
    const tableHeight = tableRef.current.scrollHeight;
    const tableWidth = tableRef.current.scrollWidth;
    const externalHeight = isVerticalScreen ? windowHeight - headerRef.current.offsetHeight : windowHeight;
    const externalWidth = isVerticalScreen ? windowWidth : windowWidth - headerRef.current.offsetWidth;

    setScale(Math.min(
      externalWidth / tableWidth,
      externalHeight / tableHeight
    ));
  }, [birthday, lifeExpectation, windowWidth, windowHeight])

  const colSpan = (isVerticalScreen ? weeksPerYear : lifeExpectation) + additionalColumns;
  const xLabel = isVerticalScreen ? 'WEEK' : 'AGE';
  const yLabel = isVerticalScreen ? 'AGE' : 'WEEK';
  const headerValues = isVerticalScreen ? weeksPerYearAsArray : lifeExpectationAsArray;
  const bodyValues = isVerticalScreen ? lifeExpectationAsArray : weeksPerYearAsArray;

  return (
    <main style={{ display: isVerticalScreen ? '' : 'flex' }}>
      <header ref={headerRef}>
        <h1>MY LIFE IN WEEKS</h1>
        <label>
          <b>BIRTHDAY:</b>
          <input type="date" value={toDateInputValue(birthday)} onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthday(e.target.valueAsDate ?? today)}/>
        </label>
        <label>
          <b>LIFE EXPECTANCY:</b>
          <input type="number" value={lifeExpectation} onChange={(e: ChangeEvent<HTMLInputElement>) => setLifeExpectation(e.target.valueAsNumber ?? 0)}/>
        </label>
      </header>

      <table ref={tableRef} style={{transform: `scale(${scale})`}}>
        <thead>
          <tr>
            <th colSpan={colSpan}>{xLabel}</th>
          </tr>
          <tr>
            {
              additionalColumnsArray.map((_) => (
                <td></td>
              ))
            }
            {
              headerValues.map((value: number, i: number) => {
                const ratioSpaceBetweenCols = isVerticalScreen ? 4 : 10;
                const checkIfDisplayValue = isVerticalScreen
                  ? (value === 1) || (value % 4 === 0)
                  : (value === 0) || (value % 5 === 0);
                const style = {
                  paddingLeft: (value % ratioSpaceBetweenCols === 0 && !isVerticalScreen) ? '0.5rem' : '',
                  paddingRight: (value % ratioSpaceBetweenCols === 0 && isVerticalScreen) ? '0.5rem' : '',
                }

                return (
                  <th key={i} scope={'col'} style={style}>
                    {
                      checkIfDisplayValue ? value : ''
                    }
                  </th>
                );
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            bodyValues.map((bodyValue: number, i: number) => {
              const ratioSpaceBetweenRows = isVerticalScreen ? 10 : 4;
              const checkIfDisplayValue = isVerticalScreen
                ? (bodyValue === 0) || (bodyValue % 5 === 0)
                : (bodyValue === 1) || (bodyValue % 4 === 0)

              return (
                <tr key={i}>
                  {
                    i === 0
                      ? <th rowSpan={(isVerticalScreen ? lifeExpectation : weeksPerYear) + additionalColumns}>{yLabel}</th>
                      : ''
                  }
                  <th scope={'row'} style={{paddingBottom: (ratioSpaceBetweenRows % 4 === 0) ? '0.5rem' : ''}}>
                    {
                      checkIfDisplayValue ? bodyValue : ''
                    }
                  </th>
                  {
                    headerValues.map((headerValue: number, j: number) => {
                      const isChecked = isVerticalScreen
                        ? (bodyValue < years) || (bodyValue === years && headerValue <= weeks)
                        : (headerValue < years) || (headerValue === years && bodyValue <= weeks);
                      const style = {
                        paddingBottom: (bodyValue % 4 === 0 && !isVerticalScreen) || (isVerticalScreen && (bodyValue +  1) % 10 === 0) ? '0.5rem' : '',
                        paddingLeft: (headerValue % 10 === 0 && !isVerticalScreen) ? '0.5rem' : '',
                        paddingRight: (headerValue % 4 === 0 && isVerticalScreen) ? '0.5rem' : '',
                      }
                      return (
                        <td key={j} style={style}>
                          <input type="checkbox" readOnly checked={isChecked}
                                 style={{backgroundColor: isChecked ? getColorByAge(isVerticalScreen ? bodyValue : headerValue) : ''}}
                          />
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </main>
  );
};

export default App;
