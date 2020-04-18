import React from 'react';
import Slide from './Slide';

class Slider extends React.Component {
  constructor(props) {
    super(props);

    this.state = { activeSlide: 0 };
  }

  prevSlide() {
    let slide = this.state.activeSlide - 1 < 0
      ? slides.length - 1
      : this.state.activeSlide - 1;
    this.setState({
      activeSlide: slide
    });
  }
  nextSlide() {
    let slide = this.state.activeSlide + 1 < slides.length
      ? this.state.activeSlide + 1
      : 0;
    this.setState({
      activeSlide: slide
    });
  }
  render() {
    var slides = this.props.slides;
    return (
      <div>
        

          {slides.map((slide, index, array) => {
            return (
              <Slide
                background={slide.background}
                text={slide.text}
                active={index === this.state.activeSlide}
              />
            );
          })}
        <div className="leftArrow" onClick={this.nextSlide.bind(this)}><i className="fa fa-4x fa-arrow-circle-right"></i></div>
        <div className="rightArrow" onClick={this.prevSlide.bind(this)}> <i className="fa fa-4x fa-arrow-circle-left"></i></div>
      </div>
    );
  }
}
export default Slider;
