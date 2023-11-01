<%@ page language="java" contentType="text/html" %>
<%
	//Grab image name to be processed
	String image = request.getParameter("file");
%>

<H2>Picking First Arrivals</H2>
<P>
Shown below is a seismic record section for file <I><%=image%></I>.
<P>
Using the left mouse button, you may select 
times of arrivals on each trace. Times are displayed 
above and below the section in red. If you 
do not like a pick, you may select it with the left mouse button 
and drag it to a new location. If you do not like any 
of your selections, you may push the <I>clear all</I>
 button to erase all of your picks.
<HR CLASS='gray'>

To display all of your time picks with channel information, push the <I>Display 
Channels & Picked Times</I> button. 
To display only your time picks, push the <I>Display Times Only</I> button.
You can copy and paste out 
of the window that is created.


<CENTER>
<OBJECT
        classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93"
        width="590" height="765" align="baseline"
codebase="http://java.sun.com/products/plugin/1.2.2/jinstall-1_2_2-win.cab#Version=1,2,2,0">
<PARAM NAME="code" VALUE="PickTimes.class">
<PARAM NAME="codebase" VALUE="APPLETS/SEIS/PICKTIMES">
<PARAM NAME="archive" VALUE="CSMStuff.jar">
<PARAM NAME="file" VALUE="../../../SEIS/OBSERVATIONS/<%=image%>">
<PARAM NAME="type" VALUE="application/x-java-applet;version=1.2.2">
<COMMENT>
        <EMBED type =
                "application/x-java-applet;version=1.2.2"
                width="590" height="765" align="baseline"

                code="PickTimes.class" codebase="APPLETS/SEIS/PICKTIMES"
                archive="CSMStuff.jar" file="../../SEIS/OBSERVATIONS/<%=image%>"
        pluginspage="http://java.sun.com/products/plugin/1.2/plugin-install.html">
        <NOEMBED>
</COMMENT>
        No Java 2 Support!!
        </NOEMBED>
</OBJECT>
</CENTER>
