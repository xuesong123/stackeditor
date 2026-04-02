@ECHO OFF
@IF exist "E:\WorkSpace" @SET WORKSPACE=E:\WorkSpace
@IF exist "d:\workspace2" @SET WORKSPACE=d:\workspace2
@set VERSION=1.0.0

@ECHO OFF copy devkit-%VERSION%.jar
@SET DIST=dist

copy "dist\stackeditor-1.0.0\stackeditor-1.0.0.es.js" "%WORKSPACE%\skin-blog\webapp\resource\stackeditor-1.0.0"
copy "dist\stackeditor-1.0.0\stackeditor-1.0.0.umd.js" "%WORKSPACE%\skin-blog\webapp\resource\stackeditor-1.0.0"
copy "dist\stackeditor-1.0.0\css\stackeditor-1.0.0.css" "%WORKSPACE%\skin-blog\webapp\resource\stackeditor-1.0.0\css"
@pause
