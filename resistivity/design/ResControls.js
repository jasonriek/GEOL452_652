
function tableUpdate()
{
    thick_toplayer_val.innerHTML = earth_model.h1f.toFixed(1)+" m";
    res_toplayer_val.innerHTML = earth_model.rho1f.toFixed(1)+" Ohm-m";
    res_midlayer_val.innerHTML = earth_model.rho2f.toFixed(1)+" Ohm-m";
    thick_midlayer_val.innerHTML = earth_model.h2f.toFixed(1)+" m";
    res_botlayer_val.innerHTML = earth_model.rho3f.toFixed(1)+" Ohm-m";
    
    e_start_val.innerHTML = survey_model.estartf.toFixed(1)+" m";
    n_dec_val.innerHTML = survey_model.ndecf.toString();
    es_per_dec_val.innerHTML = survey_model.sperdecf.toFixed(0);
    std_val.innerHTML = survey_model.stdf.toFixed(2)+" V";
    max_amp_val.innerHTML = survey_model.maxampf.toFixed(2)+" A";
    n_data_val.innerHTML = survey_model.ndataf.toString();
}

function frame_update()
{
    temp = res_sound_model.schlum;
    survey_model.schlum = is_schlum_radio.checked;
    res_sound_model.schlum = survey_model.schlum;

    tableUpdate();
    earth_model.paint();
    survey_model.paint();
    res_sound_model.getParameters();
    res_sound_model.paint();
}

is_schlum_radio.onclick = function()
{
    frame_update();
}

is_wenner_radio.onclick = function()
{
    frame_update();
}

res_toplayer_slider.oninput = function()
{
    earth_model.rho1Adjustment(this.value);
    frame_update();
}

res_midlayer_slider.oninput = function()
{
    earth_model.rho2Adjustment(this.value);
    frame_update();
}

res_botlayer_slider.oninput = function()
{
    earth_model.rho3Adjustment(this.value);
    frame_update();
}

e_start_slider.oninput = function()
{
    survey_model.eStartAdjustment(this.value);
    frame_update();
}

es_per_dec_slider.oninput = function()
{
    survey_model.sPerDecAdjustment(this.value);
    frame_update();
}

n_dec_slider.oninput = function()
{
    survey_model.nDecAdjustment(this.value);
    frame_update();
}

std_slider.oninput = function()
{
    survey_model.stdAdjustment(this.value);
    frame_update();
}

max_amp_slider.oninput = function()
{
    survey_model.maxAmpAdjustment(this.value);
    frame_update();
}

n_data_slider.oninput = function()
{
    survey_model.nDataAdjustment(this.value);
    frame_update();
}


// Canvas Mouse Events
layer_canvas.addEventListener("mousedown", earth_model.selectLayer.bind(earth_model), false);
layer_canvas.addEventListener("mousemove", earth_model.moveLayer.bind(earth_model), false);
layer_canvas.addEventListener("mouseup", earth_model.mouseUp.bind(earth_model), false);
layer_canvas.addEventListener("mouseup", frame_update, false);
frame_update();



