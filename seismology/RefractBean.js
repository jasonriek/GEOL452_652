/**
 *  JavaBean that stores refraction model parameters. This bean is used by
 *  refraction modeling servelets so that users over multiple sessions can
 *  work on the same test model. Upon Bean instantiation, all instance variables
 *  are initialized to random values. The servlet then uses these values to
 *  build refraction data for the user to interpret. Later the user, can interrogate
 *  the bean and see if their interpreted model fits the real model
 *
 * Java author Tom Boyd
 * created    November 24, 2003
 *
 * JavaScript author Jason Reek
 * created August 15, 2019
 */

function RefractBean()
{
    // Variables that define the bounds in which instance variables
    // can assume values. All thickness' are those found at an offset of
    // zero.

    // Minimum velocity of layer 1
    this.v1_min = 250.0;
    // Maximum velocity of layer 1
    this.v1_max = 750.0;
    // Minimum velocity of layer 2
    this.v2_min = 1000.0;
    // Maximum velocity of layer 2
    this.v2_max = 1800.0;
    //Minimum velocity of layer 3
    this.v3_min = 2000.0;
    // Maximum velocity of layer 3
    this.v3_max = 3500.0;
    // Minimum layer  1 thickness
    this.h1_min = 1.0;
    // Maximum layer  1 thickness
    this.h1_max = 4.0;
    // Minimum layer  2 thickness
    this.h2_min = 3.0;
    // Maximum layer  2 thickness
    this.h2_max = 7.0;
    // Minimum layer dip
    this.d_min = -0.5;
    // Maximum layer dip
    this.d_max = 0.5;
    /**
     *  Minimum distance over with model must be physically realizable.
     *  That is, boundaries will not cross at offsets less than this
     *  value.
     */
    this.r_min = 250.0;

    // Velocity of first layer (m/s)
    this.v1 = Math.random()*(this.v1_max - this.v1_min) + this.v1_min;
    // Velocity of second layer (m/s)
    this.v2 = Math.random()*(this.v2_max - this.v2_min) + this.v2_min;
   // Velocity of halfspace (m/s)
    this.v3 = Math.random()*(this.v3_max - this.v3_min) + this.v3_min;
    // Thickness of first layer (m)
    this.h1 = Math.random()*(this.h1_max - this.h1_min) + this.h1_min;
    // Thickness of second layer (m)
    this.h2 = Math.random()*(this.h2_max - this.h2_min) + this.h2_min;
    // Dip of first layer (degrees)
    this.d1 = Math.random()*(this.d_max - this.d_min) + this.d_min;
    // Dip of Second layer (degrees)
    this.d2 = Math.random()*(this.d_max - this.d_min) + this.d_min;

    // Make sure model is physically realizable
    // Do this by making sure layer boundaries do not intersect between offsets
    // of zero and rMin

    // Boundary between layers 1 and 2 first. If d1 > 0.0 boundary dips down
    // at greater offsets, these will never intersect surface in our offset range.
    // So, only check those with dips less than 0.0.
    if (this.d1 < 0.0)
    {
        // Make sure boundary does not intersect surface
        // Depth at r_min
        let test = this.h1 - this.r_min * Math.tan(toRadians(this.d1));
        // Reset dip
        if (test < 0.0)
        {
            this.d1 = toDegrees(Math.atan(this.h1 / this.r_min));
        }
    }

    // Test, and if necessary adjust layer 2/halfspace boundary so that
    // it does not interest layer 1/2 boundary

    // Depth of 1/2 at r_min
    let htest12 = this.h1 - this.r_min * Math.tan(toRadians(this.d1));
    // Depth of 2/half at r_min
    let htest2h = (this.h1 + this.h2) - this.r_min * Math.tan(toRadians(this.d2));
    // Boundaries intersect
    if (htest2h < htest12)
    {
        // Simply set layer boundaries to be parallel
        this.d2 = this.d1;
    }
    this.getV1 = function () {return this.v1;};
    this.getV2 = function () {return this.v2;};
    this.getV3 = function () {return this.v3;};
    this.getH1 = function () {return this.h1;};
    this.getH2 = function () {return this.h2;};
    this.getD1 = function () {return this.d1;};
    this.getD2 = function () {return this.d2;};

    this.seeTheBean = function()
    {
        alert((this.v1.toString()+" "+this.v2.toString()+" "+this.v3.toString()+
            "\n"+this.h1.toString()+" "+this.h2.toString()+
            "\n"+this.d1.toString()+" "+this.d2.toString()));
    };
    this.getDataArray = function()
    {
        let data_array = [["Velocity 1", "Velocity 2", "Velocity 3", "Thickness 1", "Thickness 2", "Dip 1", "Dip 2"],
        [this.v1, this.v2, this.v3, this.h1, this.h2, this.d1, this.d2]];
        return data_array;
    }
}

// Degrees to radian conversion function
function toRadians(degrees)
{
    return degrees*(Math.PI/180);
}

// Radians to degrees function
function toDegrees(radians)
{
    return radians * 180 / Math.PI;
}