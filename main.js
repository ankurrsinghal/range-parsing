(function() {

    const input = document.getElementById('input');
    const $stored = document.getElementById('stored');
    const containers = document.querySelectorAll('.input-container');
    const inputMessage = document.getElementById('main-input-message');
    const storedInputMessage = document.getElementById('stored-input-message');
    const $rangeThreshold = document.getElementById('range-threshold');
    const settingsView = document.getElementById('settings');
    const settingsTrigger = document.getElementById('settings-trigger');
    const $duplicateNumbers = document.getElementById('duplicate-numbers');
    const $uniqueNumbers = document.getElementById('unique-numbers');

    const VALUE_TYPE_NUMBER = 'number';
    const VALUE_TYPE_RANGE = 'range';
    const RANGE_MEMORY_THRESHOLD = 1e3;

    let state = {
        isSettingsVisible: false,
        stored: [1, 2, 3, 4, 5],
        input: [],
        rangeThreshold: RANGE_MEMORY_THRESHOLD
    };

    containers.forEach(container => {
        const input = container.querySelector('input');
        
        container.addEventListener('click', e => {
            container.classList.add('active');
            input.focus();
        });

        input.addEventListener('blur', e => {
            if (!input.value) {
                container.classList.remove('active');
                showMessage('');
            }
        });

    });

    settingsTrigger.addEventListener('click', _ => {
        setState({
            isSettingsVisible: !state.isSettingsVisible
        });
    });

    $rangeThreshold.addEventListener('keyup', e => {
        const value = $rangeThreshold.value;
        setState({
            rangeThreshold: value
        })
    });

    input.addEventListener('keyup', e => {
        updateMainInput();
    });

    const updateMainInput = () => {
        const value = input.value;
        try {
            const numbers = checkInputAndShowRelevantError(value);
            setState({
                input: numbers
            });
        } catch(e) {}
    }

    $stored.addEventListener('keyup', e => {
        const value = $stored.value;
        let result

        if (value) {
            const _split = value.split(',');
            for (let index = 0; index < _split.length; index++) {
                const number = _split[index].trim();
                if (number === '') {
                    storedInputMessage.innerText = 'There should be a value after ,';
                    return;
                }

                if (isNaN(number)) {
                    storedInputMessage.innerText = 'Invalid. Only numbers.';
                    return;
                }
            }

            result = value.split(',').map(_ => parseInt(_.trim()));
        } else {
            result = [];
        }

        storedInputMessage.innerText = '.';
        setState({
            stored: result
        });
    });

    const checkInputAndShowRelevantError = text => {
        if (text) {
            const _split = text.split(',');
            let result = [];
            for (let index = 0; index < _split.length; index++) {
                const value = _split[index].trim();
                const { status, message, type } = isValidValue(value);
                if (!status) {
                    showMessage(message);
                    return new Error();
                }

                if (type === VALUE_TYPE_NUMBER) {
                    result.push(parseInt(value));
                } else {
                    result = result.concat(numbersFromRange(value));
                }
            }
            
            showMessage('');
            return result;
        } else {

            showMessage('');
            return [];
        }
    };

    const isValidValue = value => {
        //is value empty
        if (value === '') {
            return error('There should be a value after ,');
        }

        //is invalid range like 1-
        const invalidRangeRegex = /^\d+-$/;
        if (invalidRangeRegex.test(value)) {
            return error('Invalid Range. There should be a number after -');
        }

        // value can be a range eg, 5-10
        const rangeRegex = /^\d+-\d+$/;
        if (rangeRegex.test(value)) {
            const _split = value.split('-');
            const firstNumber = parseInt(_split[0]);
            const secondNumber = parseInt(_split[1]);

            // check if range is valid, ie first number is lower than the second
            if (firstNumber > secondNumber) {
                return error('Invalid Range. Second number should be greater than the first number.');
            }

            if (secondNumber - firstNumber > state.rangeThreshold) {
                return error(`Sorry range threshold is set to be ${state.rangeThreshold}.`);
            }

            return success(VALUE_TYPE_RANGE);
        }

        // value can be a number
        if (!isNaN(value)) {
            return success(VALUE_TYPE_NUMBER);
        }

        return error('Invalid Input.');
    }

    const numbersFromRange = range => {
        const _split = range.split('-');
        const firstNumber = parseInt(_split[0]);
        const secondNumber = parseInt(_split[1]);

        return Array(secondNumber - firstNumber + 1).fill(1).map((_, index) => firstNumber + index);
    }

    const showMessage = message => {
        inputMessage.innerText = message;
    };

    const error = message => ({ status: false, message });
    const success = type => ({ status: true, type });

    const printArrayOfNumbers = array => {
        return array.join(', ');
    };

    const unique = (value, index, array) => { 
        return array.indexOf(value) === index;
    };

    const render = state => {
        const { isSettingsVisible, stored, rangeThreshold, input } = state;

        if (isSettingsVisible) {
            settingsView.classList.remove('hidden');
            settingsView.classList.add('visible');
        } else {
            settingsView.classList.remove('visible');
            settingsView.classList.add('hidden');
        }

        $rangeThreshold.value = rangeThreshold;

        $stored.value = printArrayOfNumbers(stored);

        const uniqueInput = input.filter(unique);
        const uniqueNumbers = uniqueInput.filter(number => !stored.includes(number));
        const duplicateNumbers = uniqueInput.filter(number => stored.includes(number));

        $uniqueNumbers.innerText = printArrayOfNumbers(uniqueNumbers);
        $duplicateNumbers.innerText = printArrayOfNumbers(duplicateNumbers);
    };

    const setState = values => {
        state = Object.assign({}, state, values);
        render(state);
    };

    render(state);
})();