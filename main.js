(function() {
    function splitDistanceAndPlace(distanceAndPlace) {
        const firstSpace = distanceAndPlace.indexOf(' ');
        const distance = distanceAndPlace.substr(0, firstSpace);
        const place = distanceAndPlace.substr(firstSpace + 1);

        return [distance, place];
    }

    function splitTrainNumberAndDistance(trainNumberAndDistance) {
        const lastSpace = trainNumberAndDistance.lastIndexOf(' ');
        const trainNumber = trainNumberAndDistance.substr(0, lastSpace);
        const distance = trainNumberAndDistance.substr(lastSpace + 1);

        return [trainNumber, distance];
    }

    function openInNewTab(url) {
        const win = window.open(url, '_blank');
        win.focus();
    }

    function createEvent() {
        const header = Array.from(document.querySelectorAll('p')).find(p => p.innerText.includes('Informacje o podróży:'))
        const keys = [
            'from',
            'to',
            'departureDate',
            'arrivalDate',
            'departureTime',
            'arrivalTime',
            'trainNumber',
            'carriage',
            'distanceAndPlace',
            'additionalInfo'
        ];

        const dictionary = new Map();
        let node = header.nextSibling;

        for (const key of keys) {
            node = node.nextSibling;
            dictionary.set(key, node.innerText);
        }
        
        const noReservationMode = /^.+ .+ .+$/.test(dictionary.get('trainNumber'));
        let [distance, place] = [null, null];
        
        if (noReservationMode) {
            const split = splitTrainNumberAndDistance(dictionary.get('trainNumber'));
            distance = split[1];
            dictionary.set('trainNumber', split[0]);
            dictionary.set('additionalInfo', dictionary.get('carriage'));
        } else {
            [distance, place] = splitDistanceAndPlace(dictionary.get('distanceAndPlace'));
        }

        const year = new Date().getFullYear();
        const [departureDay, departureMonth] = dictionary.get('departureDate').split('.');
        const [arrivalDay, arrivalMonth] = dictionary.get('arrivalDate').split('.');
        const departureDate = new Date(`${year}-${departureMonth}-${departureDay} ${dictionary.get('departureTime')}`).toISOString();
        const arrivalDate = new Date(`${year}-${arrivalMonth}-${arrivalDay} ${dictionary.get('arrivalTime')}`).toISOString();

        const event = {
            'summary': `Pociąg ${dictionary.get('from')} – ${dictionary.get('to')}`,
            'location': dictionary.get('from'),
            'description':
                `${dictionary.get('departureTime')} ${dictionary.get('from')} – ${dictionary.get('arrivalTime')} ${dictionary.get('to')}\n` +
                (noReservationMode ? '' : `Wagon: ${dictionary.get('carriage')}, miejsce: ${place}\n`) +
                `${dictionary.get('additionalInfo')}\n` +
                `Pociąg: ${dictionary.get('trainNumber')}\n` +
                `Dystans: ${distance}km`,
            'start': {
                'dateTime': departureDate,
                'timeZone': 'Europe/Warsaw'
            },
            'end': {
                'dateTime': arrivalDate,
                'timeZone': 'Europe/Warsaw'
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'popup', 'minutes': 60}
                ]
            }
        };

        return event;
    }

    openInNewTab('https://gcalendar-event-inserter.netlify.com?event=' + encodeURIComponent(JSON.stringify(createEvent())));
})();