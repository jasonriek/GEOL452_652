const TREND_TOOL_X_OFFSET = 10;

class MagneticDikeController
{
    constructor() 
    {
        // Define minimum and maximum values in user space
        // and corresponding maximums and minimums for the scroll bars
        // that must be integers.
        this.k_min = 0.00001;
        this.k_max = 0.001;
        this.d_k = 0.000005;
        this.k_bar_min = 1;
        this.k_bar_max = Math.trunc((this.k_max - this.k_min) / this.d_k + 2.1);

        // Line number selected in drop down
        this.line_number; 
        // Line spacing in meters
        this.ns_spacing; 
        // Station spacing in meters
        this.ew_spacing; 
        // Starting y location of lines
        this.y_start;
        
        this.bias_min = -50;
        this.bias_max = 50;
        this.d_bias = 1;
        this.bias_bar_min = 1;
        this.bias_bar_max = Math.trunc((this.bias_max - this.bias_min) / this.d_bias + 2.1);
        this.data_set = false; 

        // Define Variables used to Describe Model Parameters - In this case,
        // magnetic anomaly is going to be computed over a vertical dike with
        // an arbitrary trend along an east-west trending survey line.
        
        // Width of dike (m)
        this.d_width = 100.0; 
        // east-west location of dike at y=0
        this.dx_loc = 0.0; 
        // Depth to top of dike
        this.depth_to_top = -5.0; 
        // Dike trend in degrees
        this.b = 46.0; 

        // Establish Frame and plot sizes

        // Frame sizes
        this.frame_x = 300;
        this.frame_y = 540;

        // Define width and height of map-view plotting area
        this.m_width = 200;
        this.m_height = 200;

        // Now define the absolute coordinates of each of the four corners of
        // the plotting area
        this.m_ul_cor_x = Math.trunc((this.frame_x - this.m_width) / 2.0);
        this.m_ul_cor_y = Math.trunc((this.frame_x - this.m_width) / 4.0) + 25;
        this.m_ur_cor_y = this.m_ul_cor_y;
        this.m_ur_cor_x = this.m_ul_cor_x + this.m_width;
        this.m_ll_cor_x = this.m_ul_cor_x;
        this.m_ll_cor_y = this.m_ul_cor_y + this.m_height;
        this.m_lr_corx = this.m_ur_cor_x;
        this.m_lr_cor_y = this.m_ll_cor_y;

        // Set maximums and minimums in user coordinates for map view
        // and establish plot scales
        this.m_x_max = 250.0; //meters
        this.m_x_min = -250.0; //meters
        this.m_y_max = 250.0;
        this.m_y_min = -250.0;
        this.m_x_scale = this.m_width / (this.m_x_max - this.m_x_min); //pixels per meter
        this.m_y_scale = this.m_height / (this.m_y_max - this.m_y_min);

        // Define width and height of cross-section plotting area
        this.x_width = 200;
        this.x_height = 100;

        // Now define the absolute coordinates of each of the four corners of
        // the plotting area
        this.x_ul_cor_x = Math.trunc((this.frame_x - this.x_width) / 2.0);
        this.x_ul_cor_y = Math.trunc(this.m_ll_cor_y + 25);
        this.x_ur_cor_y = this.x_ul_cor_y;
        this.x_ur_cor_x = this.x_ul_cor_x + this.x_width;
        this.x_ll_cor_x = this.x_ul_cor_x;
        this.x_ll_cor_y = this.x_ul_cor_y + this.x_height;
        this.x_lr_cor_x = this.x_ur_cor_x;
        this.x_lr_cor_y = this.x_ll_cor_y;

        // Set maximums and minimums in user coordinates for map view
        // and establish plot scales
        this.x_x_max = 250.0; //meters
        this.x_x_min = -250.0; //meters
        this.x_y_max = 0.0;
        this.x_y_min = -25.0;
        this.x_x_scale = this.x_width / (this.x_x_max - this.x_x_min); //pixels per meter
        this.x_y_scale = this.x_height / (this.x_y_max - this.x_y_min);

        // Define width and height of trend tool plotting area
        this.t_width = 50;
        this.t_height = 50;

        // Now define the absolute coordinates of each of the four corners of
        // the trend tool plotting area
        this.t_ul_cor_x = Math.trunc(this.x_ur_cor_x - 20);
        this.t_ul_cor_y = Math.trunc(this.x_ur_cor_y - 10);
        this.t_ur_cor_y = this.t_ul_cor_y;
        this.t_ur_cor_x = this.t_ul_cor_x + this.t_width;
        this.t_ll_cor_x = this.t_ul_corx;
        this.t_ll_cor_y = this.t_ul_cor_y + this.t_height;
        this.t_lr_cor_x = this.t_ur_cor_x;
        this.t_lr_cor_y = this.t_ll_cor_y;
        
        //Define method variables used to control mouse motions
        this.last_x; 
        this.last_y;
        this.drag_dike;
        this.drag_trend;
        this.drag_top;
        this.drag_width;
        this.drag_x; 
        this.drag_tw;
        this.mouse_down = false; 
 
        // Set the page range sliders 
        this.setKSlider();
        this.setBiasSlider();
        
    }

    setKSlider()
    {
        k_slider.max = this.k_bar_max;
        k_slider.min = this.k_bar_min;
        k_slider.value = Math.trunc((this.k - this.k_min) * (this.k_bar_max - this.k_bar_min) / 
                                       (this.k_max - this.k_min) + this.k_bar_min + 0.5)
    }
    setBiasSlider()
    {
        bias_slider.max = this.bias_bar_max-1;
        bias_slider.min = this.bias_bar_min;
        bias_slider.value = Math.trunc((this.bias - this.bias_min) * (this.bias_bar_max - this.bias_bar_min) / 
                                       (this.bias_max - this.bias_min) + this.bias_bar_min + 0.5)
    }

    kFormat()
    {
        let k = ((parseFloat(k_slider.value) - 1) * this.d_k + this.k_min);
        return k;
    }
    biasFormat()
    {
        let bias = ((parseFloat(bias_slider.value) - 1) * this.d_bias + this.bias_min);
        return bias;
    }
    
    // Method to paint map
    drawMap()
    {
        
        let x_dif, x_width, y_dif, y_width;
        let x, y;
        let px1, px2, py1, py2;

        // Set Background colors for map and drawn them to 
        // the left panel canvas.
        controller_ctx.beginPath();
        controller_ctx.fillStyle = "#68BB59";
        controller_ctx.rect(this.m_ul_cor_x, this.m_ul_cor_y, this.m_width, this.m_height);
        controller_ctx.fill();
        controller_ctx.strokeStyle = "#000000";
        controller_ctx.lineWidth = 2;
        controller_ctx.rect(this.m_ul_cor_x, this.m_ul_cor_y, this.m_width, this.m_height)
        controller_ctx.stroke();

        // Draw top view of dike. We will compute the four corners of a
        // polygon describing the dike assuming the length of the dike is
        // 1500 meters. This length is simply choosen so that the ends will
        // always lie outside of the plot bounds so the dike will appear to
        // be continuous.

        let dike = new Polygon(controller_ctx);
        let left_clip = new Rectangle(controller_ctx, 0, 0, 49, 325, "#FFFFFF", "#FFFFFF", 0);
        let right_clip = new Rectangle(controller_ctx, 251, 49, 150, 325, "#FFFFFF", "#FFFFFF", 0);
        let top_clip = new Rectangle(controller_ctx, 49, 0, 325, 49, "#FFFFFF", "#FFFFFF", 0);
        let bottom_clip = new Rectangle(controller_ctx, 0, 251.5, 750, 750, "#FFFFFF", "#FFFFFF", 0);
        dike.bg_color = "#999999";
        
        // First compute the apparent width of the slab in the east-west (x)
        // direction. Handle singularities elegantly.
        if(this.b >= -45.0 && this.b <= 45.0)
        {
            x_width = this.d_width / Math.cos(this.b * Math.PI / 180.0);
            x_dif = 750.0 * Math.sin(-1.0 * this.b * Math.PI / 180.0);
            y_dif = 750.0 * Math.cos(-1.0 * this.b * Math.PI / 180.0);

            // Now computer corners of a polygon that bound the dike.
            y = y_dif;
            py1 = this.getMY(y);
            x = this.dx_loc - x_width / 2.0 - x_dif;
            px1 = this.getMX(x);
            dike.addPoint(px1, py1);
            x = this.dx_loc + x_width / 2.0 - x_dif;
            px1 = this.getMX(x);
            dike.addPoint(px1, py1);
            y = -1.0 * y_dif;
            py1 = this.getMY(y);
            x = this.dx_loc + x_width / 2.0 + x_dif;
            px1 = this.getMX(x);
            dike.addPoint(px1, py1);
            x = this.dx_loc - x_width / 2.0 + x_dif;
            px1 = this.getMX(x);
            dike.addPoint(px1, py1);
            y = y_dif;
            py1 = this.getMY(y);
            x = this.dx_loc - x_width / 2.0 - x_dif;
            px1 = this.getMX(x);
            dike.addPoint(px1, py1);
        }   
        else 
        {
            y_width = Math.abs(this.d_width / Math.sin(this.b * Math.PI / 180.0));
            y_dif = 750.0 * Math.cos(this.b * Math.PI / 180.0);
            x_dif = 750.0 * Math.sin(this.b * Math.PI / 180.0);

            //Now compute corners of a polygon that bound the dike
            x = this.dx_loc + x_dif;
            px1 = this.getMX(x);
            y = y_width / 2.0 + y_dif;
            py1 = this.getMY(y);
            dike.addPoint(px1, py1);
            y = -1.0 * y_width / 2.0 + y_dif;
            py1 = this.getMY(y);
            dike.addPoint(px1, py1);
            x = -1.0 * x_dif + this.dx_loc;
            px1 = this.getMX(x);
            y = -1.0 * y_width / 2.0 - y_dif;
            py1 = this.getMY(y);
            dike.addPoint(px1, py1);
            y = y_width / 2.0 - y_dif;
            py1 = this.getMY(y);
            dike.addPoint(px1, py1);
            x = this.dx_loc + x_dif;
            px1 = this.getMX(x);
            y = y_width / 2.0 + y_dif;
            py1 = this.getMY(y);
            dike.addPoint(px1, py1);
        }
        
        
        // Now draw dike. First establish clip
        // path around the image, then draw the dike irregardless of whether
        // it is completely contained within the map. All drawing to the
        // outside of the map view must be done BEFORE this point.
        dike.draw();
        left_clip.draw();
        right_clip.draw();
        top_clip.draw();
        bottom_clip.draw();

         //Draw some labels around map area
         controller_ctx.fillStyle = "#000000";
         controller_ctx.font = "16px Ariel";
         controller_ctx.fillText("A", 35, 155);
         controller_ctx.fillText("A'", 255, 155);

        // Draw tick marks around outside edges
        for (x = this.m_x_min; x <= this.m_x_max; x += 25.0) 
        {
            px1 = this.getMX(x);
            py1 = this.getMY(this.m_y_max);
            py2 = this.getMY(this.m_y_max - 10);
            this.drawLine(px1, py1, px1, py2);
            py1 = this.getMY(this.m_y_min);
            py2 = this.getMY(this.m_y_min + 10);
            this.drawLine(px1, py1, px1, py2);
        }
        for (y = this.m_y_min; y <= this.m_y_max; y += 25.0) 
        {
            py1 = this.getMY(y);
            px1 = this.getMX(this.m_x_max);
            px2 = this.getMX(this.m_x_max - 10);
            this.drawLine(px1, py1, px2, py1);
            px1 = this.getMX(this.m_x_min);
            px2 = this.getMX(this.m_x_min + 10);
            this.drawLine(px1, py1, px2, py1);
        }

        // Draw line indicating locations of cross section
        this.drawLine(this.m_ul_cor_x, (this.m_ul_cor_y + this.m_ll_cor_y) / 2, this.m_ur_cor_x, (this.m_ul_cor_y + this.m_ll_cor_y) / 2);

        // Now draw the location of the magnetic stations to be modeled
        y = mag_buried_dike.y_start + mag_buried_dike.line_number * mag_buried_dike.ns_spacing;
        for(x = this.m_x_min; x <= this.m_x_max; x += mag_buried_dike.ew_spacing) 
        {
            px1 = this.getMX(x);
            py1 = this.getMY(y);
            let c = new Circle(controller_ctx, px1 - 2, py1 - 2, 4, "#DD0000");
            c.draw();
        }
        
    }

    // Method to paint trend tool
    drawTrendTool()
    {
        // Draw Background
        let trend_rectangle = new Rectangle(controller_ctx, this.t_ul_cor_x+TREND_TOOL_X_OFFSET, this.t_ul_cor_y, this.t_width, this.t_height, "#EE0000", "#000000", 2);

        // Draw Azimuth circle
        let azimuth_circle = new Circle(controller_ctx, this.t_ul_cor_x+TREND_TOOL_X_OFFSET, this.t_ul_cor_y, this.t_width, "#000000", 2);

        // Draw Line representing trend of dike
        let cx = this.t_ul_cor_x+TREND_TOOL_X_OFFSET + this.t_width / 2;
        let cy = this.t_ul_cor_y + this.t_height / 2;
        let radius = this.t_width / 2;
        let dx = Math.trunc(radius * Math.cos(Math.PI / 2.0 - this.b * Math.PI / 180.0));
        let dy = Math.trunc(radius * Math.sin(Math.PI / 2.0 - this.b * Math.PI / 180.0));
        
        trend_rectangle.draw();
        azimuth_circle.draw();
        this.drawLine(cx - dx, cy + dy, cx + dx, cy - dy, "#000000");
        
        // Trend Tool Labels
        controller_ctx.fillStyle = "#000000";
        controller_ctx.fillText("W", this.t_ul_cor_x-18+TREND_TOOL_X_OFFSET, (this.t_ul_cor_y+(this.t_height/2)+5));
        controller_ctx.fillText("N", this.t_ul_cor_x+(this.t_width/2)-5+TREND_TOOL_X_OFFSET, this.t_ul_cor_y-3);
        controller_ctx.fillText("S", this.t_ul_cor_x+(this.t_width/2)-5+TREND_TOOL_X_OFFSET, this.t_ul_cor_y+this.t_height+15);
        controller_ctx.fillText("E", this.t_ur_cor_x+3+TREND_TOOL_X_OFFSET, this.t_ul_cor_y+(this.t_height/2)+5);
    }

    // Method to paint cross section
    drawXSection()
    {
        let depth;
        let px, py, px1, py1;
        let x1, x2;
        let x_width = 100000.0;
        let label = "";
        // Draw background
        let x_section_rectangle = new Rectangle(controller_ctx, this.x_ul_cor_x, this.x_ul_cor_y, this.x_width, this.x_height, "#BEA58F", "#000000", 2);
        let dike_rectangle = null;
        let left_clip = new Rectangle(controller_ctx, 0, 250, 48, 1000,"#FFFFFF", "#FFFFFF", 0);
        let right_clip = new Rectangle(controller_ctx, 252, 250, 100, 1000,"#FFFFFF", "#FFFFFF", 0);
        x_section_rectangle.draw();

        // Draw Xsection of slab
        if (this.b != 90.0)
            x_width = this.d_width / Math.cos(this.b * Math.PI / 180.0);
        if (this.b == 90.0 || x_width > 100000.0)
            x_width = 100000.0;

        x1 = this.dx_loc - x_width / 2.0;
        x2 = this.dx_loc + x_width / 2.0;
        if (x1 < this.x_x_min)
            x1 = this.x_x_min;
        if (x2 > this.x_x_max)
            x2 = this.x_x_max;
        px = this.getXX(x1);
        py = this.getXY(this.depth_to_top);
        px1 = this.getXX(x2) - px;
        py1 = this.getXY(this.x_y_min) - py;

        controller_ctx.fillStyle = "gray";
        dike_rectangle = new Rectangle(controller_ctx, px, py, px1, py1, "#999999", "#000000");
        dike_rectangle.draw();
        left_clip.draw();
        right_clip.draw();

        // Draw tick marks and labels
        controller_ctx.fillStyle = "#000000";
        controller_ctx.font = "14px Ariel";
        for(depth = this.x_y_max; depth > this.x_y_min; depth -= 5.0) 
        {
            px = this.getXX(this.x_x_min);
            py = this.getXY(depth);
            this.drawLine(px, py, px + 5, py);
            label = Math.trunc(-1*depth).toFixed(0);   
            if(label.length === 1)
                controller_ctx.fillText(label, px - 10, py + 5);
            else if(label.length === 2)
                controller_ctx.fillText(label, px - 17, py + 5);
        }

        // Finish with a couple more labels
        controller_ctx.font = "16px Ariel";
        controller_ctx.fillStyle = "#000000";
        controller_ctx.fillText("A", this.x_ll_cor_x - 15, this.x_ll_cor_y+1);
        controller_ctx.fillText("A'", this.x_lr_cor_x + 5, this.x_lr_cor_y+1);
    }

    paint()
    {
        controller_ctx.clearRect(0, 0, controller_canvas.width, controller_canvas.height);
        this.drawMap();
        
        this.drawXSection();
        this.drawTrendTool();
    }

    //Compute x pixel location for map graphic
    getMX(x) {return Math.trunc((x - this.m_x_min) * this.m_x_scale + this.m_ll_cor_x);}

    //Compute y pixel location for map graphic
    getMY(y) {return Math.trunc((this.m_y_max - y) * this.m_y_scale + this.m_ul_cor_y);}

    //Compute x pixel location for cross section graphic
    getXX(x) {return Math.trunc((x - this.x_x_min) * this.x_x_scale + this.x_ll_cor_x);}

    //Compute y pixel location for cross section graphic
    getXY(y) {return Math.trunc((this.x_y_max - y) * this.x_y_scale + this.x_ul_cor_y);}

    // Draw line function
    drawLine(x1, y1, x2, y2, color="#000000")
    {
        controller_ctx.beginPath();
        controller_ctx.moveTo(x1, y1);
        controller_ctx.lineTo(x2, y2);
        controller_ctx.lineWidth = 2;
        controller_ctx.strokeStyle = color;
        controller_ctx.stroke();
    }

    // Method to test the location of the last Mouse down. If
    // the location is within the map view test to see if we should
    // be dragging the dike to a new location.
    selectFeature(event)
    {
        this.mouse_down = true; 
        if(event.target == controller_canvas)
            event.preventDefault();

        let x = event.offsetX;
        let y = event.offsetY;

        // Mouse location tolerance in pixels.
        let tol = 5;

        // Reset variables used to hold location of initial mouse down.
        this.last_y = 0;
        this.last_x = 0;
        this.drag_dike = false;
        this.drag_trend = false;
        this.drag_top = false;
        this.drag_width = false;
        this.drag_x = false;
        this.drag_tw = false;


        // First see if mouse down was within map view. 
        if(x >= this.m_ul_cor_x && x <= this.m_ur_cor_x && y >= this.m_ul_cor_y && y <= this.m_ll_cor_y)
        {
            this.drag_dike = true;
            this.last_x = x;
        }

        // See if mouse down was in trend tool.
        if (x >= this.t_ul_cor_x && x <= this.t_ur_cor_x && y >= this.t_ul_cor_y && y <= this.t_ll_cor_y) 
        {
            this.drag_trend = true;
            this.last_x = x;
            this.last_y = y;
        }

        //See if mouse down was in the cross section
        if (x >= this.x_ul_cor_x && x <= this.x_ur_cor_x && y >= this.x_ul_cor_y && y <= this.x_ll_cor_y) 
        {
            // We can vary one of four things in this frame:
            //   1) We can change the depth to the top of the dike
            //   2) We can change the width of the dike
            //   3) We can change width and depth simultaneously
            //   4) We can change the east-west location of the dike
            // We will determine what the user wants to do by looking
            // at the location ofthe mouse down

            // Compute locations of the top two corners of the dike
            let x_width = 100000.0;
            if (this.b != 90.0)
                x_width = this.d_width / Math.cos(this.b * Math.PI / 180.0);
            if (this.b == 90.0 || x_width > 100000.0)
                    x_width = 100000.0;
            let xl = this.getXX(this.dx_loc - x_width / 2.0);
            let xr = this.getXX(this.dx_loc + x_width / 2.0);
            let yt = this.getXY(this.depth_to_top);

            // Now lets see if we want to change width and top
            // simultaneously. This is done if we mouse down near
            // one of the top corners of the dike
            let dist1, dist2;
            dist1 = Math.sqrt((x - xl) * (x - xl) + (y - yt) * (y - yt));
            dist2 = Math.sqrt((x - xr) * (x - xr) + (y - yt) * (y - yt));
            if (dist1 < tol || dist2 < tol) 
            {
                    this.drag_tw = true;
                    this.last_x = x;
                    this.last_y = y;
            }

            // See if user is dragging the top only. 
            if (x <= xr && x >= xl && y <= yt + tol && y >= yt - tol) 
            {
                    this.drag_top = true;
                    this.last_y = y;
            }

            // See if user is dragging the side of the dike only. 
            if ((x >= xr - tol && x <= xr + tol && y >= yt) || (x >= xl - tol && x <= xl + tol && y >= yt)) 
            {
                    this.drag_width = true;
                    this.last_x = x;
            }

        }
    }

    // Reset values when mouse is up
    resetFeature(event)
    {
        // Reset variables used to hold location of initial mouse down.
        this.mouse_down = false;
        this.last_y = 0;
        this.last_x = 0;
        this.drag_dike = false;
        this.drag_trend = false;
        this.drag_top = false;
        this.drag_width = false;
        this.drag_x = false;
        this.drag_tw = false;
    }

    // If Mouse has initiated a drag near an edge, change the appropriate
    // values in repaint the applet. Only update the window after the mouse
    // has moved 5 or more pixels.
    moveFeature(event) 
    {
        if (this.mouse_down)
        {
            let x = event.offsetX;
            let y = event.offsetY;
            let tol = 5;

            // See if user is dragging the dike
            if (this.drag_dike) 
            {
                if (Math.abs(x - this.last_x) >= tol) 
                {
                    this.dx_loc += (x - this.last_x) / this.m_x_scale;
                    if (this.dx_loc < -500.0)
                        this.dx_loc = -500.0;
                    if (this.dx_loc > 500.0)
                        this.dx_loc = 500.0;
                    this.last_x = x;
                }
                return;
            }        
            // See if user is changing dike trend
            if (this.drag_trend) 
            {
                let cx = this.t_ul_cor_x + this.t_width / 2;
                let cy = this.t_ul_cor_y + this.t_height / 2;
                let ob = Math.atan((this.last_x - cx) / (this.last_y - cy)) * 180.0 / Math.PI;
                let nb = Math.atan((x - cx) / (y - cy)) * 180.0 / Math.PI;
                if (Math.abs(nb - ob) >= tol) 
                {
                    this.b += (ob - nb);
                    // Bound b to be between -90 and 90.
                    if (this.b > 90.0)
                        this.b -= 180.0;
                    if (this.b < -90.0)
                        this.b += 180.0;

                    // Round b off to the nearest multiple of tol. 
                    if (this.b >= 0.0)
                        this.b += tol / 2.0;
                    if (this.b < 0.0)
                        this.b -= tol / 2.0;
                        
                    this.b = Math.trunc(this.b / tol);
                    this.b *= tol;

                    this.last_x = x;
                    this.last_y = y;
                }
                return;
            }

            //See if user is trying to change the depth and width of
            //the dike simultaneously
            if (this.drag_tw) 
            {
                let ydist = y - this.last_y;

                // Change depth to top of dike.
                if (Math.abs(ydist) > tol / 2.0)
                {
                    // Compute new depth to top.
                    ydist /= this.x_y_scale;
                    this.depth_to_top -= ydist;
                    // Convert depth to nearest 0.5 m.
                    this.depth_to_top = (0.5 * Math.trunc((this.depth_to_top - 0.25) / 0.5));
                    this.last_y = y;
                }
                let x_dist = x - this.last_x;
                // Change width of dike.
                if (Math.abs(x_dist) > tol / 5.0)
                {
                    x_dist /= this.x_x_scale;
                    let x_width = this.d_width / Math.cos(this.b * Math.PI / 180.0);
                    let xl = this.getXX(this.dx_loc - x_width / 2.0);
                    let xr = this.getXX(this.dx_loc + x_width / 2.0);
                    
                    // Adjust width
                    if (Math.abs(x - xl) < Math.abs(x - xr))
                        x_width -= (x_dist * 2.0);
                    else
                        x_width += (x_dist * 2.0);
                    // fix minimum dike width
                    if (x_width < 2.5)
                        x_width = 2.5; 
                    this.d_width = x_width * Math.cos(this.b * Math.PI / 180.0);
                    this.d_width = (2.5 * Math.trunc((this.d_width + 1.25) / 2.5));
                    this.last_x = x;
                }    
                return;
            }

            // See if user is attempting to change depth to top of dike.
            if (this.drag_top) 
            {
                let y_dist = y - this.last_y;
                // Change depth to top of dike. 
                if (Math.abs(y_dist) > tol / 2.0)
                {
                    // Compute new depth to top
                    y_dist /= this.x_y_scale;
                    this.depth_to_top -= y_dist;
                    // Convert depth to nearest 0.5 m.
                    this.depth_to_top = (0.5 * Math.trunc((this.depth_to_top - 0.25) / 0.5));
                    this.last_y = y;           
                }
                return;
            }

            // See if user is attempting to change the width of the dike
            if (this.drag_width) 
            {
                let x_dist = x - this.last_x;
                if (Math.abs(x_dist) > tol / 5.0)//change width of dike
                {
                    x_dist /= this.x_x_scale;
                    let x_width = this.d_width / Math.cos(this.b * Math.PI / 180.0);
                    let xl = this.getXX(this.dx_loc - x_width / 2.0);
                    let xr = this.getXX(this.dx_loc + x_width / 2.0);
                    
                    // Adjust width
                    if (Math.abs(x - xl) < Math.abs(x - xr))
                        x_width -= (x_dist * 2.0);
                    else
                        x_width += (x_dist * 2.0);
                    
                    // Fix minimum dike width.
                    if (x_width < 2.5)
                        x_width = 2.5; 
                    
                    this.d_width = x_width * Math.cos(this.b * Math.PI / 180.0);
                    this.d_width = (2.5 * Math.trunc((this.d_width + 1.25) / 2.5));
                    this.last_x = x;
                    }
                    return;
                }
        }
    }

    // Get and set values for drop down menu
    setLineDrop(n_lines, line_values, ns_space, ew_space, yst)
    {
        // If menu has been populated, remove all values. 
        y_loc_cbox.options.length = 0;

        //Add new drop values
        for (let i = 0; i < n_lines; i++)
            y_loc_cbox.options[y_loc_cbox.options.length] = new Option(line_values[i]+" meters", '0');
        
        // Set the initial value of the drop down to be at or near y = 0.
        this.line_number = 0;

        for (let i = 0; i < n_lines; i++)
        {
            if (line_values[i] <= 0.0)
                this.line_number = i;
        }
        y_loc_cbox.selectedIndex = this.line_number;

        // Set method variables for station and line spacing
        this.ns_spacing = ns_space;
        this.ew_space = ew_space;
        this.y_start = yst;
    }

    lineSelect()
    {
        this.line_number = y_loc_cbox.selectedIndex;  
    }

    // Updates values to the magnetic dike model from
    // the controls. 
    magDikeGetControlVal()
    {
        mag_buried_dike.b = this.b;
        mag_buried_dike.depth_to_top = this.depth_to_top;
        mag_buried_dike.x_loc = this.dx_loc;
        if(magnetic_dike_controller.data_set)
        {
            mag_buried_dike.width = this.d_width;
            mag_buried_dike.line_number = this.line_number;
        }
 
    }
}
magnetic_dike_controller = new MagneticDikeController();
mag_buried_dike.setTableValues();


y_loc_cbox.onchange = function()
{
    magnetic_dike_controller.lineSelect();
};

file_input.onchange = function ()
{
    let file = this.files[0];
    let reader = new FileReader();
    let x_data = [];
    let y_data = [];
    let n_data = null;

    let x_old = -1000.0;
    let y_old = -1000.0;
    mag_buried_dike.y_start = -1000.0;
    mag_buried_dike.n_lines = 0;

    //Initialize x min and max values of data to something unreasonable and
    //then update as we read data
    mag_buried_dike.x_min = 10000.0;
    mag_buried_dike.x_max = -100000.0;
    
    reader.onload = function(progressEvent)
    {
        // By lines
        let rows = this.result.split('\n');
        for(let i = 0; i<rows.length; i++)
        {
            row = rows[i].split(",");
			if(row[0] != "" && row[1] != "")
			{
				x_data.push(parseInt(row[0]));
				y_data.push(parseInt(row[1]));
            }
			if(i >= mag_buried_dike.readings.length)
                mag_buried_dike.readings.push(parseFloat(row[2]));
            else
                mag_buried_dike.readings[i] = parseFloat(row[2]);
        }
        n_data = x_data.length;

        for(let i=0; i < n_data; i++) 
        {
            // First look at the x-coordinates

            // If different from old update spacing
            if (y_data[i] === y_old && x_data[i] != x_old)
            {
                mag_buried_dike.ew_spacing = Math.abs(x_data[i] - x_old);
                x_old = x_data[i];
            }
            // Reset min and max x values
            if (x_data[i] < mag_buried_dike.x_min)
                mag_buried_dike.x_min = x_data[i];
            if (x_data[i] > mag_buried_dike.x_max)
                mag_buried_dike.x_max = x_data[i];
        
            //Now look at the y coordinates

            // Initialize starting y value
            if (mag_buried_dike.y_start === -1000.0)
                mag_buried_dike.y_start = y_data[i]; 
            
                // If different from old update spacing and build line_value array
            if (y_data[i] != y_old)
            {
                mag_buried_dike.line_values[mag_buried_dike.n_lines] = y_data[i];
                mag_buried_dike.n_lines++;
                mag_buried_dike.ns_spacing = Math.abs(y_data[i] - y_old);
                y_old = y_data[i];
            }
        }
        // Reset horizontal plot scale
        mag_buried_dike.x_scale = G_WIDTH / (mag_buried_dike.x_max - mag_buried_dike.x_min);
        magnetic_dike_controller.setLineDrop(mag_buried_dike.n_lines, 
                                             mag_buried_dike.line_values, 
                                             mag_buried_dike.ns_spacing, 
                                             mag_buried_dike.ew_spacing, 
                                             mag_buried_dike.y_start);
        magnetic_dike_controller.data_set = true; 
    };
    reader.readAsText(file);
};

k_slider.oninput = function()
{
    mag_buried_dike.k = magnetic_dike_controller.kFormat();
};

bias_slider.oninput = function()
{
    mag_buried_dike.bias = magnetic_dike_controller.biasFormat();
};

// Canvas Mouse Events
controller_canvas.addEventListener("mousedown", magnetic_dike_controller.selectFeature.bind(magnetic_dike_controller), false);
controller_canvas.addEventListener("mousemove", magnetic_dike_controller.moveFeature.bind(magnetic_dike_controller), false)
controller_canvas.addEventListener("mouseup", magnetic_dike_controller.resetFeature.bind(magnetic_dike_controller), false)
controller_canvas.addEventListener("mouseout", magnetic_dike_controller.resetFeature.bind(magnetic_dike_controller), false)

function loop(time_stamp) 
{
    magnetic_dike_controller.magDikeGetControlVal();
    mag_buried_dike.setTableValues();
    mag_buried_dike.paint();
    magnetic_dike_controller.paint();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);