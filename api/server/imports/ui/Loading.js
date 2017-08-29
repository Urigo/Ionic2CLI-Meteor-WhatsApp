import React from 'react';

/*
 * A reusable loading component
 */

const Loading = () => (
  <div className="Loading">
    <div className="Loading-bounce Loading-bounce--1" />
    <div className="Loading-bounce Loading-bounce--2" />
    <div className="Loading-bounce Loading-bounce--3" />
  </div>
);

export default Loading;
