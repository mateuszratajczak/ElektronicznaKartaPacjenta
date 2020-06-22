const options = {}
const express       = require('express');
const app           = express();
var server          = require('http').Server(options, app);
const bodyParser    = require('body-parser');
var mkFhir = require('fhir.js');
var client = mkFhir({
    baseUrl: 'http://hapi.fhir.org/baseR4'
});
var client2 = mkFhir({
    baseUrl: 'http://hapi.fhir.org/baseR4'
});

app.use(express.static('public'));
app.use(bodyParser.json());                                           
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));        
app.use(bodyParser.urlencoded({ extended: true }));                     
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//app.set('view engine','hbs')
app.set('view engine','ejs')

server.listen(80)

// query: {name: 'nazwisko' }, {birthdate : 'data'}, { _id : id}, {_count: ile_wyswietlic}, {gender: 'female/male'}

app.get('/showpatlist', function(request, response){
    
    client
    .search({type: 'Patient', query: { family: request.query.patient, _count: 50, _sort : 'family'}}) 
    .then(function(res){
         var bundle = res.data;
        
        if(bundle.entry)
        {
            for(var i=0; i<bundle.entry.length; i++) 
            {
                console.log("Nr " + i);
                console.log("Full URL " + bundle.entry[i].fullUrl);
                console.log("Pacjent ID " + bundle.entry[i].resource.id);
                if(bundle.entry[i].resource.name)
                {
                    console.log("Name " + bundle.entry[i].resource.name[0].family);
                }
                console.log("Birth date " + bundle.entry[i].resource.birthDate);
                console.log("Gender " + bundle.entry[i].resource.gender);
                console.log("----------------------------------");
            }
        }else
        {
            console.log("Brak danych");
        }
        
        response.render('patient.ejs' , {bundle: bundle, find: request.query.patient});
        response.end();
        
    })
    .catch(function(res){        
        if (res.status)
        {
            console.log('Error', res.status);
        }

        if (res.message)
        {
            console.log('Error', res.message);
        }
    });
    return
})

//, date: {$and: {$gt: '1964-10-01', $lt: '1964-10-30'}}
app.get('/showobservation', function(request, response){
    client
    .search( {type: 'Observation', query: { patient: request.query.id, date: {$ge: request.query.start, $le: request.query.end}, _sort: 'date', _count: 50}})
    .then(function(res){
        var bundle = res.data;
        if(bundle.entry)
        {
            for(var i=0; i<bundle.entry.length; i++) 
            {    
                console.log("URL    : " + bundle.entry[i].fullUrl);
                console.log("PATIENT: " + bundle.entry[i].resource.id);
                console.log("STATUS : " + bundle.entry[i].resource.status);
                console.log("SUBJECT REF: " + bundle.entry[i].resource.subject.reference);
                console.log("DATA       : " + bundle.entry[i].resource.effectiveDateTime);
                console.log("NOTE       : " + bundle.entry[i].resource.note);
                console.log("BODY PART  : " + bundle.entry[i].resource.bodySite);
                console.log("----------------------------------");
            }
        }else
        {
            console.log("Brak danych");
        }

        response.render('observation.ejs' , {bundle: bundle, find: request.query.find, start: request.query.start, end: request.query.end});
        response.end();
    })
    .catch(function(res){
        if (res.status){
            console.log('Error', res.status);
        }

        if (res.message){
            console.log('Error', res.message);
        }
    });    

    return
})

app.get('/showmedicationstate', async function(request, response){
    
    client
    .search( {type: 'MedicationStatement', query: { patient: request.query.id, _count: 50}})
    .then(function(res){
        var bundle = res.data;
        var med = [];
        if(bundle.entry)
        {
            for(var i=0; i<bundle.entry.length; i++) 
            {
            
                console.log("DATE: " + bundle.entry[i].resource.meta.lastUpdated);
                if(bundle.entry[i].resource.dosage)
                    console.log("DOSAGE: " + bundle.entry[i].resource.dosage[0].text);
                console.log("SUBJECT : " + bundle.entry[i].resource.subject.reference);
                if(bundle.entry[i].resource.medicationCodeableConcept)
                    console.log("TXT: " + bundle.entry[i].resource.medicationCodeableConcept.text);
                
                if(bundle.entry[i].resource.medicationReference)
                    console.log("MED REF: " + bundle.entry[i].resource.medicationReference.reference.split('/')[1]);

                console.log("----------------------------------");
            }
        }else
        {
            console.log("Brak danych");
        }
        
        response.render('medicalstate.ejs' , {bundle: bundle, find: request.query.find});
        response.end();
    })
    .catch(function(res){
        if (res.status){
            console.log('Error', res.status);
        }

        if (res.message){
            console.log('Error', res.message);
        }
    });
    
    return
})


app.get('/showmedication', function(request, response){
    
    client
    .search( {type: 'Medication', query: { _id: request.query.id, _count: 50}})
    .then(function(res){
        var bundle = res.data;
        
        if(bundle.entry)
        {
            for(var i=0; i<bundle.entry.length; i++) 
            {
                if(bundle.entry[i].resource.text.div)
                {
                    console.log("MED: " + bundle.entry[i].resource.text.div);
                }
                console.log("----------------------------------");
                
            }
        }else
        {
            console.log("Brak danych");
        }
        
        response.render('medication.ejs' , {bundle: bundle, find: request.query.find, pat: request.query.patient});
        response.end();
        
    })
    .catch(function(res){
        if (res.status){
            console.log('Error', res.status);
        }

        if (res.message){
            console.log('Error', res.message);
        }
    });
    
    return
})