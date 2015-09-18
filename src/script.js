// Code goes here
var marg={top:65,right:20,bottom:20,left:200},
	w=745-marg.left-marg.right,
	h=568-marg.top-marg.bottom;
	u=w+marg.left+marg.right+200,
	v=h+marg.top+marg.bottom+10;
var rawdata,newdata,maxval_y,maxval_x,minval_x,minval_y,ch,scaleX,scaleY,axis_x,axis_y,station_name;
var min_max_lat_lon=[];
var Longitude=[];
var Latitude=[];
var begname="";
var p=d3.select("body").append("svg").attr("width", u).attr("height", v).append("g").attr("transform", "translate(" + marg.left + "," + marg.top + ")");
var mycolor	= ["#00008F","#00009F","#0000AF","#0000BF","#0000CF",
				"#0000DF","#0000EF","#0000FF","#000FFF","#001FFF",
				"#002FFF","#003FFF","#004FFF","#005FFF","#006FFF",
				"#007FFF","#008FFF","#009FFF","#00AFFF","#00BFFF",
				"#00CFFF","#00DFFF","#00EFFF","#00FFFF","#0FFFFF",
				"#1FFFDF","#2FFFCF","#3FFFBF","#4FFFAF","#5FFF9F",
				"#6FFF8F","#7FFF7F","#8FFF6F","#9FFF5F","#AFFF4F",
				"#BFFF3F","#CFFF2F","#DFFF1F","#EFFF0F","#FFFF00",
				"#FFEF00","#FFDF00","#FFCF00","#FFBF00","#FFAF00",
				"#FF9F00","#FF8F00","#FF7F00","#FF6F00","#FF5F00",
				"#FF4F00","#FF3F00","#FF2F00","#FF1F00","#FF0F00",
				"#FF0000","#EF0000","#DF0000","#CF0000","#BF0000",
				"#AF0000","#9F0000","#8F0000","#7F0000"];
				
var stnname=[["Delhi",28.58975, 77.22195,"DEMS"]];

window.onload=function()
{
clearall();
d3.csv("coordinates1.csv", function(d){			
			rawdata=d;
			indmap();
		});
};
		
function indmap()			//function to plot india map
{
	clearall();

	maxval_x=d3.max(rawdata,function(d)
	{ 
		return Math.max(d["Longitude"]); 
	});
	maxval_y=d3.max(rawdata,function(d)
	{ 
		return Math.max(d["Latitude"]); 
	});
	minval_x=d3.min(rawdata,function(d)
	{ 
		return Math.min(d["Longitude"]); 
	});
	minval_y=d3.min(rawdata,function(d)
	{ 
		return Math.min(d["Latitude"]); 
	});


	var scaleX=d3.scale.linear().range([0, w]).domain([minval_x-1, maxval_x+0.5]);
	var scaleY=d3.scale.linear().range([h, 0]).domain([minval_y-0.5, maxval_y+0.5]);
			
	var axisX=d3.svg.axis().scale(scaleX).tickSize(1).ticks(4).orient("bottom");
	var axisY=d3.svg.axis().scale(scaleY).tickSize(1).ticks(4).orient("left");
	
	p.append("g").attr("class","x axis").call(axisX).attr("transform","translate(0,"+h+")");
	p.append("g").attr("class","y axis").call(axisY).attr("transform","translate(0,0)");
	
	p.append("rect").attr("class","outer-boundary").attr("width",w).attr("height",h);

	var lineGen=d3.svg.line().x(function(d){return scaleX(d["Longitude"]);}).y(function(d){return scaleY(d["Latitude"]);});
			
	p.append("path").attr("class","line").attr('d', lineGen(rawdata));//.insert("path","bubble")

	p.append("text").attr("x",(w-13 - marg.right)/2).attr("y",(h - marg.top+90)).style("font-size","16px").text("Longitude");
	p.append("text").attr("transform", "rotate(-90)").attr("x",0-(h/2)-50).attr("y",(marg.left-225)).style("font-size","16px").text("Latitude");

	//add grids
	p.selectAll("line.horizontalGrid").data(scaleY.ticks(10)).enter().append("line")
        	.attr(
        		{
				"class":"horizontalGrid",
			        "x1" : 0,
				"x2" : w,
			        "y1" : function(d){ return scaleY(d);},
         			"y2" : function(d){ return scaleY(d);},
				"stroke-dasharray":("3,3")
        		});

	p.selectAll("line.verticalGrid").data(scaleX.ticks(10)).enter().append("line")
	       	.attr(
        		{
        			"class":"verticalGrid",
           			"y1" : 0,
            			"y2" : h,
            			"x1" : function(d){ return scaleX(d);},
            			"x2" : function(d){ return scaleX(d);},
				"stroke-dasharray":("3,3")
        		});
			
	var color = d3.scale.category10();
	var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0); //for mouse-hover values

	var point=p.selectAll(".point").data(stnname).enter().append("circle").attr("class", "point").attr("r", 6)
    			.attr("cx", function(d){return scaleX(d[2]);})
      			.attr("cy", function(d){return scaleY(d[1]);})
				.on("mouseover", function(d) {
         			tooltip.transition().duration(200).style("opacity", 1);
         			tooltip.html( "<br/>" + d[0] )
         	    			.style("left", (d3.event.pageX + 5) + "px")
               				.style("top", (d3.event.pageY - 28) + "px");
     			 })
      			.on("mouseout", function(d) {
       				   tooltip.transition()
          			     .duration(1)
            			   .style("opacity", 0);
     			 });

	point.on("click",function(d){
			tooltip.transition()
          			     .duration(1)
            			   .style("opacity", 0);
     			 stnmap(d);
	});
}

function stnmap(val)					//function to plot the selected station
{
	clearall();
	
	var mydata,fname;
	station_name=val[3];
	var mybound,q;
	var stn_boundary=begname.concat("final_boundary_lat_lon_2km.csv");
	var datafile1=begname.concat(station_name,"_00_1.csv");
	var datafile2=begname.concat(station_name,"_00_2.csv");
	var datafile3=begname.concat(station_name,"_00_3.csv");
	var datafile4=begname.concat(station_name,"_00_4.csv");
	
	fname=begname.concat(station_name,"_coordinates.csv");
	
	d3.csv(stn_boundary, function(b){
			mybound=b;
			for(q=0;q<16;q++)
			{
				if(mybound[q].Station == station_name)
				{
					min_max_lat_lon[0]=mybound[q].Lat_min;
					min_max_lat_lon[1]=mybound[q].Lat_max;
					min_max_lat_lon[2]=mybound[q].Lon_min;					
					min_max_lat_lon[3]=mybound[q].Lon_max;
				}
			}
	});
	d3.csv(fname,function(d)
	{
		mydata=d;				
		
		minval_x=parseFloat(min_max_lat_lon[2]);
		maxval_x=parseFloat(min_max_lat_lon[3]);
		minval_y=parseFloat(min_max_lat_lon[0]);
		maxval_y=parseFloat(min_max_lat_lon[1]);
		
		if(station_name=="VOMM")
			scaleX=d3.scale.linear().range([0, w]).domain([minval_x, maxval_x+0.5]);
		else if(station_name=="VECC")
			scaleX=d3.scale.linear().range([0, w]).domain([minval_x, maxval_x+1.7]);
		else
			scaleX=d3.scale.linear().range([0, w]).domain([minval_x-0.01, maxval_x+0.01]);
		
		scaleY=d3.scale.linear().range([h, 0]).domain([minval_y-0.03, maxval_y+0.02]);
		
		axisX=d3.svg.axis().scale(scaleX).tickSize(1).ticks(4).orient("bottom");
		axisY=d3.svg.axis().scale(scaleY).tickSize(1).ticks(4).orient("left");
		p.append("g").attr("class","x axis").call(axisX).attr("transform","translate(0,"+h+")");
		p.append("g").attr("class","y axis").call(axisY).attr("transform","translate(0,0)");
		p.append("rect").attr("class","outer-boundary").attr("width",w).attr("height",h);

		p.append("text").attr("x",(w-13 - marg.right)/2).attr("y",(h - marg.top+90)).style("font-size","16px").text("Longitude");
		p.append("text").attr("transform", "rotate(-90)").attr("x",0-(h/2)-50).attr("y",(marg.left-225)).style("font-size","16px").text("Latitude");

		p.selectAll(".dot").data(mydata).enter().append("circle").attr("class", "dot").attr("r", 1)
		.attr("cx", function(d) { return scaleX(d["Longitude"]);})
		.attr("cy", function(d) { return scaleY(d["Latitude"]);});

		//add grids
		p.selectAll("line.horizontalGrid").data(scaleY.ticks(10)).enter().append("line")
		.attr
		({
			"class":"horizontalGrid",
			"x1" : 0,
			"x2" : w,
			"y1" : function(d){ return scaleY(d);},
			"y2" : function(d){ return scaleY(d);},
			"stroke-dasharray":("3,3")
		});

		p.selectAll("line.verticalGrid").data(scaleX.ticks(10)).enter().append("line")
		.attr
		({
			"class":"verticalGrid",
			"y1" : 0,
			"y2" : h,
			"x1" : function(d){ return scaleX(d);},
			"x2" : function(d){ return scaleX(d);},
			"stroke-dasharray":("3,3")
		});
		queue(4).defer(d3.csv, datafile1).defer(d3.csv, datafile2).defer(d3.csv, datafile3).await(datamap);
	});
}

function datamap(error, val1, val2, val3)				//function to plot the data
{
	var mydata1=val1,
	mydata2=val2,
	mydata3=val3;
	var flength=mydata1.length;
	var i=0,j=0,k=0,m=0,n=0,lat=0,lon=0, templa,templo;
	var incr;									//for 2km resolution
	
	//adding legend
	var legend_w=w+30;
	var legend_h;							
	var legend=p.selectAll(".legend")
				.data(mycolor)
				.enter()
				.append("g")
				.attr("class", "legend")
				.each(function(d, i){
					var g = d3.select(this);
					g.append("rect").attr("x", legend_w).attr("y", (64-i)*7).attr("width",50).attr("height", 30).style("fill", mycolor[i]).style("stroke", "none");
					g.append("text").attr("x", legend_w+45).attr("y", 14).style("font-size",15).text("-60");
					g.append("text").attr("x", legend_w+45).attr("y", 185).style("font-size",15).text("-40");
					g.append("text").attr("x", legend_w+45).attr("y", 332).style("font-size",15).text("-20");
					g.append("text").attr("x", legend_w+45).attr("y", 479).style("font-size",15).text("-0");
				});
	var latlon=min_max_lat_lon.map(function(item){ return parseFloat(item);});
	
	var count1=0,count2=0;

	Longitude[0]=latlon[2];
	Latitude[0]=latlon[0];
	lat=latlon[0];
	lon=latlon[2];
	templa=lat;
	templo=lon;
	
	incr=0.01666;

	while(templa<=latlon[1])
	{
		count1++;
		templa=templa+incr;
	}
	while(templo<=latlon[3])
	{
		count2++;
		templo=templo+incr;
	}
	for(j=0;j<=flength;)
	{
		for(m=0;m<count1;m++)
		{
			Latitude[j+1]=Latitude[j]+incr;
			j++;
		}
		Latitude[j]=lat;
	}
	for(i=0;i<=flength;)
	{
		for(k=i;k<count1+i;k++)
		{
			Longitude[k]=lon;
		}	
		i=i+count1;		
		lon=lon+incr;
		Longitude[i]=lon;
	}
	
	setTimeout(mymapping,0,mydata1);
	setTimeout(mymapping,0,mydata2);
	setTimeout(mymapping,0,mydata3);
}
function mymapping(d)			//function for plotting data points one by one
{
	p.selectAll("ellipse").remove();
	var thisdata=d;
	var index=d3.keys(thisdata[0])
			.filter(function(d) { return d; })
			.sort();
	var idx=index[0];
	p.selectAll(".R").attr("class", "ellipse")
					.data(thisdata)
					.enter()
					.append("ellipse")
					.attr("cx", function(d,i){ return scaleX(Longitude[i]);}) //console.log(i);
					.attr("cy", function(d,i){ return scaleY(Latitude[i]);})
					.attr({
						"rx": 2.5,
						"ry": 2.5,
					})
					.attr("fill", function(d,i)
					{     
						d[idx]=(d[idx]/2)+32;
						for(i=0; i<64; i++)
						{
							if (d[idx]===0)
								return mycolor[0];
							else if(d[idx]>i && d[idx]<=(i+1))
								return mycolor[i];
							else if(d[idx]<0)
								return "none";
						}
					});
}

function clearall(){				//function to clear previous plotting
	p.selectAll("g").remove();
	p.selectAll("text").remove();
	p.selectAll("path").remove();
	p.selectAll("rect").remove();
	p.selectAll(".dot").remove();
	p.selectAll(".point").remove();
	p.selectAll("line.horizontalGrid").remove();
	p.selectAll("line.verticalGrid").remove();
	p.selectAll("line").remove();
	p.selectAll("ellipse").remove();
	p.selectAll("circle").remove();
}
