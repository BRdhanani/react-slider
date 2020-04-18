import React from 'react';
import ReactDOM from 'react-dom';
import Slider from './Slider';

let slides = [
  {
    background: "https://www.w3schools.com/w3images/coffee.jpg",
    text: "Coffee"
  },
  {
    background: "https://www.w3schools.com/w3images/workbench.jpg",
    text: "Workbench"
  },
  {
    background: "https://www.w3schools.com/w3images/sound.jpg",
    text: "Sound"
  }
];

ReactDOM.render(<Slider slides={slides} />, document.getElementById('root'));
