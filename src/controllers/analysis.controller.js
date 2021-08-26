var Polycircle = require('./Polycircle.js');
const WayPoints = require('../models/waypoint');
const Trackpoint = require('../models/trackpoint.js');
const toolsCtrl = require('./tools.controller');

const analysisCtrl = {};

analysisCtrl.createCircle = (lat,long,rad)=>{
    /**
     * Crea y retorna un array con las coordenadas de los puntos correspondientes a los circulos (lat y long)
     */
    circle = Polycircle.vertices(latitude=lat, longitude=long, radius=rad, number_of_vertices=100);
    return circle;
};

analysisCtrl.verifyPoint = (lat,long,pointsCircle,center)=>{
    /**
     * Este metodo verifica si un punto dado está dentro de un circulo de waypoint
     */
    for(var i = 0; i<= pointsCircle.length-1;i++){
        distanceWithPoints = analysisCtrl.checkDistance(lat,long,center[0],center[1]);
        distanceWithCircle = analysisCtrl.checkDistance(pointsCircle[i][0],pointsCircle[i][1],center[0],center[1]);
        if(distanceWithPoints<distanceWithCircle){
            return true;
        }
    }
    return false;
};

analysisCtrl.checkWaypoints= (waypoints,trackpoints)=>{
    var penalization = 0;
    var listNoPassedWaypoints = [];
    var dzPoints = [];
    for(var i=0; i<= waypoints.length-1;i++){
        latitudeWayPoint = waypoints[i].location.coordinates[0];
        longitudeWayPoint = waypoints[i].location.coordinates[1];
        typeWaypoint = waypoints[i].location.type;
        idWaypoint =waypoints[i]._id;
        

        var startTime;
        var finishTime;
        var distanceDZ
        var distanceFZ;
        var speedMax;
        var passedByDZ;
        var averageSpeed;

        
        if(typeWaypoint=='WPM'){             
            listCircle = analysisCtrl.createCircle(latitudeWayPoint,longitudeWayPoint,waypoints[i].rule.ratius);   
            if(!analysisCtrl.checkWPM(listCircle,trackpoints,[latitudeWayPoint,longitudeWayPoint])){
                penalization = penalization + toolsCtrl.HHMMSSToHours(waypoints[i].rule.penalization)*60;
                listNoPassedWaypoints.push(waypoints[i])
            }
        }else if(typeWaypoint=='DZ'){
            listCircle = analysisCtrl.createCircle(latitudeWayPoint,longitudeWayPoint,waypoints[i].rule.ratius);//waypoints[i].rule.ratius);                
            dzCheckerId = analysisCtrl.checkDZFZ(listCircle,trackpoints,[latitudeWayPoint,longitudeWayPoint])
            
            if(dzCheckerId!=0){
                
                fecha = new Date(Date.parse(dzCheckerId.time));

                distanceDZ=parseFloat(waypoints[i].distance);
                speedMax = parseFloat(waypoints[i].speed);

                startTimeSeconds =fecha.getSeconds();
                startTimeMinutes =fecha.getMinutes();
                startTimeHour = fecha.getHours();
                startTime = startTimeSeconds + (startTimeMinutes*60) + (startTimeHour*3600);

                passedByDZ = true;
            }else{
                listNoPassedWaypoints.push(waypoints[i]);
                penalization = penalization + toolsCtrl.HHMMSSToHours(waypoints[i].rule.penalization)*60;
                passedByDZ=false;
            }
        }else if(typeWaypoint=='FZ'){
                listCircle = analysisCtrl.createCircle(latitudeWayPoint,longitudeWayPoint,waypoints[i].rule.ratius);//,waypoints[i].rule.ratius);
                fzChecker=analysisCtrl.checkDZFZ(listCircle,trackpoints,[latitudeWayPoint,longitudeWayPoint]);
                
                if(fzChecker!=0){
                    fecha = new Date(Date.parse(fzChecker.time));

                    distanceFZ=parseFloat(waypoints[i].distance);
                    startTimeSeconds =fecha.getSeconds();
                    startTimeMinutes =fecha.getMinutes();
                    startTimeHour = fecha.getHours();
                    
                    finishTime = startTimeSeconds + (startTimeMinutes*60) + (startTimeHour*3600)
                   
                    if(passedByDZ){
                        
                        averageSpeed = analysisCtrl.calculateSpeed(distanceDZ,startTime,distanceFZ,finishTime);
                        penalizationSpeed =    analysisCtrl.calculateSpeedPenalization(averageSpeed,speedMax);             
                        penalization = penalization + penalizationSpeed;
                        if ( penalizationSpeed>0 )
                        {
                            dzPoints.push({
                                id:dzPoints.length+1,
                                averageSpeed:String(Math.round(averageSpeed*100)/100)+'km/h',
                                penalization:toolsCtrl.hoursToHHMMSS(penalizationSpeed/60),
                                latitude:latitudeWayPoint,
                                longitude:longitudeWayPoint
                            })
                        }
                    }else{
                        penalization = penalization + toolsCtrl.HHMMSSToHours(waypoints[i].rule.penalization)*60;//Si no pasa por FZ NI DZ QUE SE HACE?
                    }      
                }else{
                    listNoPassedWaypoints.push(waypoints[i]);
                }            
        }
    }

    return {noPassedWaypoints:listNoPassedWaypoints,
        totalPenalization:penalization,
        dzPoints: dzPoints};
};

analysisCtrl.calculateSpeedPenalization=(speed,speedLimit)=>{
    penalization = 0;
    if(speed <= speedLimit){
        return 0;
    }else{
        speedDifference = speed - speedLimit;
        penalization=Math.ceil(speedDifference/10)+Math.round(speedDifference);
    }
    return penalization;
};

analysisCtrl.calculateSpeed=(distance1,time1,distance2,time2)=>{
    if(time1==time2){
        return 0;
    }
    speed = ((distance2-distance1)*3600)/(time2-time1);
    return speed;
};

analysisCtrl.checkWPM=(listCircle,trackpoints,center)=>{
    for(var i=0;i<=trackpoints.length-1;i++){
        lat = trackpoints[i].location.coordinates[0];
        long = trackpoints[i].location.coordinates[1];
        verifyWaypoint=analysisCtrl.verifyPoint(lat,long,listCircle,center);
        if(verifyWaypoint){
            return true;
        }
    }
    return false;
};

analysisCtrl.checkDZFZ=(listCircle,trackpoints,center)=>{
    for(var i=0;i<=trackpoints.length-1;i++){
        lat = trackpoints[i].location.coordinates[0];
        long = trackpoints[i].location.coordinates[1];
        verifyWaypoint=analysisCtrl.verifyPoint(lat,long,listCircle,center);
        if(verifyWaypoint){     
            return trackpoints[i];
        }
    }
    return 0;
};

analysisCtrl.checkDistance=(lat1,long1,lat2,long2)=>{
        const R = 6371e3; 
        const phi1 = lat1 * Math.PI/180; 
        const phi2 = lat2 * Math.PI/180;
        const phiDiference = (lat2-lat1) * Math.PI/180;
        const lambdaDiference = (long2-long1) * Math.PI/180;

        const a = Math.sin(phiDiference/2) * Math.sin(phiDiference/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(lambdaDiference/2) * Math.sin(lambdaDiference/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R*c*1000; // in kilometres
        
        return d;
}


module.exports = analysisCtrl;