/*
    Author: Jason Reek
    Date: 12/6/2019

    Handles the behavior of the accordian objects in the geophysics websites.
*/

let acc = document.getElementsByClassName("accordion");
window.addEventListener("resize", changeAccBehavior);

function changeAccBehavior()
{
    if(window.innerWidth >= 1450)
    {
            for (let i = 0; i < acc.length; i++) 
            {
                acc[i].nextElementSibling.classList.remove("filler");
                acc[i].nextElementSibling.classList.remove("show");
                acc[i].nextElementSibling.classList.remove("show2");

                acc[i].onclick = function()
                {
                    if (this.nextElementSibling.classList.contains("filler"))
                        this.nextElementSibling.classList.toggle("filler");
                    
                    this.nextElementSibling.classList.toggle("show");
                    if (!this.nextElementSibling.classList.contains("show"))
                        this.nextElementSibling.classList.toggle("filler");
                    
                    for (let j = 0; j < acc.length; j++)
                        if(this.innerHTML != acc[j].innerHTML)
                        {
                            if (acc[j].nextElementSibling.classList.contains("show"))
                                acc[j].nextElementSibling.classList.toggle("show");
                            if (!acc[j].nextElementSibling.classList.contains("filler"))
                                acc[j].nextElementSibling.classList.toggle("filler"); 
                        }
                        if (!checkForShows())
                            for (j = 0; j < acc.length; j++)
                                acc[j].nextElementSibling.classList.toggle("filler"); 
                }
            }
    }

    else if(window.innerWidth < 1450)
    {
        for (let i = 0; i < acc.length; i++) 
        {
            
            acc[i].nextElementSibling.classList.remove("filler");
            acc[i].nextElementSibling.classList.remove("show");
            acc[i].nextElementSibling.classList.remove("show2");

            acc[i].onclick = function()
            {
                this.classList.toggle("active");
                this.nextElementSibling.classList.toggle("show2");
            }
        }
    }
}
  
function checkForShows()
{
    for (let j = 0; j < acc.length; j++)
        if(acc[j].nextElementSibling.classList.contains("show"))
            return true
    return false 
}

changeAccBehavior();