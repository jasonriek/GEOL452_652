/*
    Author: Jason Reek
    Date: 12/6/2019

    Handles the behavior of the accordian objects in the geophysics websites.
*/

let acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) 
{
    acc[i].onclick = function()
    {      
        this.classList.toggle("active");  
        this.nextElementSibling.classList.toggle("show");
        if (!this.nextElementSibling.classList.contains("show"))
            this.nextElementSibling.classList.toggle("filler");
        
    }
}

