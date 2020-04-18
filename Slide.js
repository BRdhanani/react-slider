import React from 'react';

class Slide extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let slideStyle = { backgroundImage: `url( ${this.props.background})` };
    return (
        <div
          className="slider__slide"
          data-active={this.props.active}
          style={slideStyle}
        >
          <div className="slider__slide__text">{this.props.text}</div>
        </div>
    );
  }
}
export default Slide;
