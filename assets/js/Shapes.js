/*
 Jason's Shape Library 
 Last updated: 1/14/2020

 A simple shape library for drawing
 in the HTML5 based canvas. 
*/

// Circle Object
class Circle
{
    constructor(canvas_ctx, x, y, r, color, border_thickness=1)
    {
        this.canvas_ctx = canvas_ctx;
        this.startingAngle = 0;
        this.endAngle = 2 * Math.PI;
        this.border_thickness = border_thickness;
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }
    
    draw() 
    {
        try
        {
            this.canvas_ctx.beginPath();
            // Treating r as a diameter to mimic java oval() function.
            // arc() method doesn't center to diameter, but builds out from origin.
            // I've added the radius to center the oval/circle object to grid.
            // -Jason
            this.canvas_ctx.arc(this.x+((this.r/2)), this.y+((this.r/2)), this.r/2, this.startingAngle, this.endAngle);
            this.canvas_ctx.lineWidth = this.border_thickness;
            this.canvas_ctx.strokeStyle = this.color;
            this.canvas_ctx.stroke();
            this.canvas_ctx.closePath();
        }
        catch(err)
        {
            console.log(err.message);
        }
    }
}

// Basic Circle Object using JS Arc 
class JSCircle
{
    constructor(canvas_ctx, x, y, r, color="#000000")
    {
        this.canvas_ctx = canvas_ctx;
        this.startingAngle = 0;
        this.endAngle = 2 * Math.PI;
        this.x = x;
        this.y = y;
        this.r = r;
        this.stroke = color;
    }

    draw() 
    {
        this.canvas_ctx.beginPath();
        this.canvas_ctx.arc(this.x, this.y, this.r, this.startingAngle, this.endAngle);
        this.canvas_ctx.lineWidth = 1;
        this.canvas_ctx.strokeStyle = this.stroke;
        this.canvas_ctx.stroke();
    }
}

class Rectangle
{
    constructor(canvas_ctx, x, y, w, h, color, border_color="#000000", border_thickness=2, top_border=false, bottom_border=false, left_border=false, right_border=false)
    {
        this.canvas_ctx = canvas_ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.border_color = border_color; 
        this.border_thickness = border_thickness;
        this.left_border = left_border;
        this.right_border = right_border;
        this.top_border = top_border;
        this.bottom_border = bottom_border;
    }

    drawSideBorder(x1, y1, x2, y2)
    {
        this.canvas_ctx.beginPath();
        this.canvas_ctx.moveTo(x1, y1);
        this.canvas_ctx.lineTo(x2, y2);
        this.canvas_ctx.stroke();
    }

    draw()
    {
        try
        {
            this.canvas_ctx.beginPath();
            this.canvas_ctx.rect(this.x, this.y, this.w, this.h);
            this.canvas_ctx.fillStyle = this.color;
            this.canvas_ctx.fill();

            this.canvas_ctx.lineWidth = this.border_thickness;
            this.canvas_ctx.strokeStyle = this.border_color;
            if(this.top_border)
                this.drawSideBorder(this.x, this.y, this.x+this.w, this.y);
            if(this.bottom_border)
                this.drawSideBorder(this.x, this.y+this.h, this.x+this.w, this.y+this.h);
            if(this.left_border)
                this.drawSideBorder(this.x, this.y-1, this.x, this.y+this.h);
            if(this.right_border)
                this.drawSideBorder(this.x+this.w, this.y-1, this.x+this.w, this.y+this.h);
            else
                this.canvas_ctx.stroke();
            this.canvas_ctx.closePath();
        }
        catch(err)
        {
            console.log(err.message);
        }

    }
}

class Polygon
{
    constructor(canvas_ctx, x_points=[], y_points=[], bg_color="#000000", border_thickness=1, border_color="#000000")
    {
        this.canvas_ctx = canvas_ctx;
        this.bg_color = bg_color;
        this.border_thickness = border_thickness;
        this.border_color = border_color;
        this.x_points = x_points;
        this.y_points = y_points;
        
    }

    draw()
    {
        this.canvas_ctx.fillStyle = this.bg_color;
        this.canvas_ctx.lineWidth = this.border_thickness;
        this.canvas_ctx.strokeStyle = this.border_color;
        this.canvas_ctx.beginPath();
        this.canvas_ctx.moveTo(this.x_points[0], this.y_points[0]);
        for(let i = 1; i<this.x_points.length; i++)
            this.canvas_ctx.lineTo(this.x_points[i], this.y_points[i]);
        
            this.canvas_ctx.fill();
        this.canvas_ctx.stroke();
        this.canvas_ctx.closePath();
    }

    addPoint(x, y)
    {
        this.x_points.push(x);
        this.y_points.push(y);
    }
}