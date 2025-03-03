<?xml version="1.0"?>
<flowgorithm fileversion="3.0">
    <attributes>
        <attribute name="name" value=""/>
        <attribute name="authors" value="vamsi krishna"/>
        <attribute name="about" value=""/>
        <attribute name="saved" value="2023-01-07 12:10:21 PM"/>
        <attribute name="created" value="dmFtc2kga3Jpc2huYTtMQVBUT1AtOUE3N0FBSjg7MjAyMy0wMS0wNzsxMjowNjowMSBQTTszNTk4"/>
        <attribute name="edited" value="dmFtc2kga3Jpc2huYTtMQVBUT1AtOUE3N0FBSjg7MjAyMy0wMS0wNzsxMjowNjowNiBQTTsxO3ZhbXNpIGtyaXNobmE7TEFQVE9QLTlBNzdBQUo4OzIwMjMtMDEtMDc7MTE6NTE6MzQgQU07MTJ0aCBxIHN0cmluZ3MuZnByZzs5MTY4"/>
        <attribute name="edited" value="dmFtc2kga3Jpc2huYTtMQVBUT1AtOUE3N0FBSjg7MjAyMy0wMS0wNzsxMjoxMDoyMSBQTTs0OzM3MDY="/>
    </attributes>
    <function name="Main" type="None" variable="">
        <parameters/>
        <body>
            <declare name="k, n" type="String" array="False" size=""/>
            <declare name="j, i, m, l" type="Integer" array="False" size=""/>
            <input variable="k"/>
            <assign variable="l" expression="len(k)"/>
            <assign variable="n" expression="&quot;&quot;"/>
            <for variable="i" start="0" end="l-1" direction="inc" step="1">
                <assign variable="m" expression="Tocode(char(k,i))"/>
                <if expression="m&gt;=97&amp;&amp;m&lt;=122">
                    <then>
                        <assign variable="m" expression="m-32"/>
                        <assign variable="n" expression="n&amp;Tochar(m)"/>
                    </then>
                    <else>
                        <assign variable="n" expression="n&amp;Tochar(m)"/>
                    </else>
                </if>
            </for>
            <output expression="n" newline="True"/>
        </body>
    </function>
</flowgorithm>
