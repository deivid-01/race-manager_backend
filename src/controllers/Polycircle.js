var GeographicLib = require("geographiclib");

const Polycircle = {};

Polycircle.vertices = (latitude,longitude,radius,number_of_vertices)=>{
       var vertices = [];

        for(var i=0;i<=number_of_vertices;i++){
            degree = 360.0/number_of_vertices*i;
            vertex = GeographicLib.Geodesic.WGS84.Direct(latitude,longitude,degree,radius);
            lat = vertex['lat2'];
            lon = vertex['lon2'];
            vertices.push([lat,lon]);        
        };
        return vertices;
};

module.exports = Polycircle;



