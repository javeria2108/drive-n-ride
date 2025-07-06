'use client';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const page = () => {
  const specFile = 'src\public\swagger.json';
  
  return (
    <div>
      <SwaggerUI url={specFile} />
    </div>
  )
}

export default page