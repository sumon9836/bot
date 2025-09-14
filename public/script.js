const API_BASE_URL = '/api';

// DOM Elements
const pairForm = document.getElementById('pairForm');
const pairNumberInput = document.getElementById('pairNumber');
const phoneError = document.getElementById('phoneError');
const refreshBtn = document.getElementById('refreshBtn');
const headerRefreshBtn = document.getElementById('headerRefreshBtn');
const sessionsGrid = document.getElementById('sessionsGrid');
const sessionsLoader = document.getElementById('sessionsLoader');
const sessionsError = document.getElementById('sessionsError');
const sessionsEmpty = document.getElementById('sessionsEmpty');
const sessionsErrorMessage = document.getElementById('sessionsErrorMessage');
const retrySessionsBtn = document.getElementById('retrySessionsBtn');
const sessionCount = document.getElementById('sessionCount');
const toast = document.getElementById('toast');

// 🌍 Country Codes Database with Flags
const COUNTRY_CODES = {
    '1': { flag: '🇺🇸', name: 'United States', maxLength: 10 },
    '7': { flag: '🇷🇺', name: 'Russia', maxLength: 10 },
    '20': { flag: '🇪🇬', name: 'Egypt', maxLength: 10 },
    '27': { flag: '🇿🇦', name: 'South Africa', maxLength: 9 },
    '30': { flag: '🇬🇷', name: 'Greece', maxLength: 10 },
    '31': { flag: '🇳🇱', name: 'Netherlands', maxLength: 9 },
    '32': { flag: '🇧🇪', name: 'Belgium', maxLength: 9 },
    '33': { flag: '🇫🇷', name: 'France', maxLength: 10 },
    '34': { flag: '🇪🇸', name: 'Spain', maxLength: 9 },
    '36': { flag: '🇭🇺', name: 'Hungary', maxLength: 9 },
    '39': { flag: '🇮🇹', name: 'Italy', maxLength: 10 },
    '40': { flag: '🇷🇴', name: 'Romania', maxLength: 9 },
    '41': { flag: '🇨🇭', name: 'Switzerland', maxLength: 9 },
    '43': { flag: '🇦🇹', name: 'Austria', maxLength: 11 },
    '44': { flag: '🇬🇧', name: 'United Kingdom', maxLength: 10 },
    '45': { flag: '🇩🇰', name: 'Denmark', maxLength: 8 },
    '46': { flag: '🇸🇪', name: 'Sweden', maxLength: 9 },
    '47': { flag: '🇳🇴', name: 'Norway', maxLength: 8 },
    '48': { flag: '🇵🇱', name: 'Poland', maxLength: 9 },
    '49': { flag: '🇩🇪', name: 'Germany', maxLength: 11 },
    '51': { flag: '🇵🇪', name: 'Peru', maxLength: 9 },
    '52': { flag: '🇲🇽', name: 'Mexico', maxLength: 10 },
    '53': { flag: '🇨🇺', name: 'Cuba', maxLength: 8 },
    '54': { flag: '🇦🇷', name: 'Argentina', maxLength: 10 },
    '55': { flag: '🇧🇷', name: 'Brazil', maxLength: 11 },
    '56': { flag: '🇨🇱', name: 'Chile', maxLength: 9 },
    '57': { flag: '🇨🇴', name: 'Colombia', maxLength: 10 },
    '58': { flag: '🇻🇪', name: 'Venezuela', maxLength: 10 },
    '60': { flag: '🇲🇾', name: 'Malaysia', maxLength: 9 },
    '61': { flag: '🇦🇺', name: 'Australia', maxLength: 9 },
    '62': { flag: '🇮🇩', name: 'Indonesia', maxLength: 11 },
    '63': { flag: '🇵🇭', name: 'Philippines', maxLength: 10 },
    '64': { flag: '🇳🇿', name: 'New Zealand', maxLength: 9 },
    '65': { flag: '🇸🇬', name: 'Singapore', maxLength: 8 },
    '66': { flag: '🇹🇭', name: 'Thailand', maxLength: 9 },
    '81': { flag: '🇯🇵', name: 'Japan', maxLength: 11 },
    '82': { flag: '🇰🇷', name: 'South Korea', maxLength: 10 },
    '84': { flag: '🇻🇳', name: 'Vietnam', maxLength: 9 },
    '86': { flag: '🇨🇳', name: 'China', maxLength: 11 },
    '90': { flag: '🇹🇷', name: 'Turkey', maxLength: 10 },
    '91': { flag: '🇮🇳', name: 'India', maxLength: 10 },
    '92': { flag: '🇵🇰', name: 'Pakistan', maxLength: 10 },
    '93': { flag: '🇦🇫', name: 'Afghanistan', maxLength: 9 },
    '94': { flag: '🇱🇰', name: 'Sri Lanka', maxLength: 9 },
    '95': { flag: '🇲🇲', name: 'Myanmar', maxLength: 9 },
    '98': { flag: '🇮🇷', name: 'Iran', maxLength: 10 },
    '212': { flag: '🇲🇦', name: 'Morocco', maxLength: 9 },
    '213': { flag: '🇩🇿', name: 'Algeria', maxLength: 9 },
    '216': { flag: '🇹🇳', name: 'Tunisia', maxLength: 8 },
    '218': { flag: '🇱🇾', name: 'Libya', maxLength: 9 },
    '220': { flag: '🇬🇲', name: 'Gambia', maxLength: 7 },
    '221': { flag: '🇸🇳', name: 'Senegal', maxLength: 9 },
    '222': { flag: '🇲🇷', name: 'Mauritania', maxLength: 8 },
    '223': { flag: '🇲🇱', name: 'Mali', maxLength: 8 },
    '224': { flag: '🇬🇳', name: 'Guinea', maxLength: 9 },
    '225': { flag: '🇨🇮', name: 'Ivory Coast', maxLength: 8 },
    '226': { flag: '🇧🇫', name: 'Burkina Faso', maxLength: 8 },
    '227': { flag: '🇳🇪', name: 'Niger', maxLength: 8 },
    '228': { flag: '🇹🇬', name: 'Togo', maxLength: 8 },
    '229': { flag: '🇧🇯', name: 'Benin', maxLength: 8 },
    '230': { flag: '🇲🇺', name: 'Mauritius', maxLength: 8 },
    '231': { flag: '🇱🇷', name: 'Liberia', maxLength: 8 },
    '232': { flag: '🇸🇱', name: 'Sierra Leone', maxLength: 8 },
    '233': { flag: '🇬🇭', name: 'Ghana', maxLength: 9 },
    '234': { flag: '🇳🇬', name: 'Nigeria', maxLength: 10 },
    '235': { flag: '🇹🇩', name: 'Chad', maxLength: 8 },
    '236': { flag: '🇨🇫', name: 'Central African Republic', maxLength: 8 },
    '237': { flag: '🇨🇲', name: 'Cameroon', maxLength: 9 },
    '238': { flag: '🇨🇻', name: 'Cape Verde', maxLength: 7 },
    '239': { flag: '🇸🇹', name: 'Sao Tome and Principe', maxLength: 7 },
    '240': { flag: '🇬🇶', name: 'Equatorial Guinea', maxLength: 9 },
    '241': { flag: '🇬🇦', name: 'Gabon', maxLength: 8 },
    '242': { flag: '🇨🇬', name: 'Republic of the Congo', maxLength: 9 },
    '243': { flag: '🇨🇩', name: 'Democratic Republic of the Congo', maxLength: 9 },
    '244': { flag: '🇦🇴', name: 'Angola', maxLength: 9 },
    '245': { flag: '🇬🇼', name: 'Guinea-Bissau', maxLength: 7 },
    '246': { flag: '🇮🇴', name: 'British Indian Ocean Territory', maxLength: 7 },
    '248': { flag: '🇸🇨', name: 'Seychelles', maxLength: 7 },
    '249': { flag: '🇸🇩', name: 'Sudan', maxLength: 9 },
    '250': { flag: '🇷🇼', name: 'Rwanda', maxLength: 9 },
    '251': { flag: '🇪🇹', name: 'Ethiopia', maxLength: 9 },
    '252': { flag: '🇸🇴', name: 'Somalia', maxLength: 8 },
    '253': { flag: '🇩🇯', name: 'Djibouti', maxLength: 8 },
    '254': { flag: '🇰🇪', name: 'Kenya', maxLength: 9 },
    '255': { flag: '🇹🇿', name: 'Tanzania', maxLength: 9 },
    '256': { flag: '🇺🇬', name: 'Uganda', maxLength: 9 },
    '257': { flag: '🇧🇮', name: 'Burundi', maxLength: 8 },
    '258': { flag: '🇲🇿', name: 'Mozambique', maxLength: 9 },
    '260': { flag: '🇿🇲', name: 'Zambia', maxLength: 9 },
    '261': { flag: '🇲🇬', name: 'Madagascar', maxLength: 9 },
    '262': { flag: '🇷🇪', name: 'Reunion', maxLength: 9 },
    '263': { flag: '🇿🇼', name: 'Zimbabwe', maxLength: 9 },
    '264': { flag: '🇳🇦', name: 'Namibia', maxLength: 9 },
    '265': { flag: '🇲🇼', name: 'Malawi', maxLength: 9 },
    '266': { flag: '🇱🇸', name: 'Lesotho', maxLength: 8 },
    '267': { flag: '🇧🇼', name: 'Botswana', maxLength: 8 },
    '268': { flag: '🇸🇿', name: 'Swaziland', maxLength: 8 },
    '269': { flag: '🇰🇲', name: 'Comoros', maxLength: 7 },
    '290': { flag: '🇸🇭', name: 'Saint Helena', maxLength: 4 },
    '291': { flag: '🇪🇷', name: 'Eritrea', maxLength: 7 },
    '297': { flag: '🇦🇼', name: 'Aruba', maxLength: 7 },
    '298': { flag: '🇫🇴', name: 'Faroe Islands', maxLength: 6 },
    '299': { flag: '🇬🇱', name: 'Greenland', maxLength: 6 },
    '350': { flag: '🇬🇮', name: 'Gibraltar', maxLength: 8 },
    '351': { flag: '🇵🇹', name: 'Portugal', maxLength: 9 },
    '352': { flag: '🇱🇺', name: 'Luxembourg', maxLength: 9 },
    '353': { flag: '🇮🇪', name: 'Ireland', maxLength: 9 },
    '354': { flag: '🇮🇸', name: 'Iceland', maxLength: 7 },
    '355': { flag: '🇦🇱', name: 'Albania', maxLength: 9 },
    '356': { flag: '🇲🇹', name: 'Malta', maxLength: 8 },
    '357': { flag: '🇨🇾', name: 'Cyprus', maxLength: 8 },
    '358': { flag: '🇫🇮', name: 'Finland', maxLength: 10 },
    '359': { flag: '🇧🇬', name: 'Bulgaria', maxLength: 9 },
    '370': { flag: '🇱🇹', name: 'Lithuania', maxLength: 8 },
    '371': { flag: '🇱🇻', name: 'Latvia', maxLength: 8 },
    '372': { flag: '🇪🇪', name: 'Estonia', maxLength: 8 },
    '373': { flag: '🇲🇩', name: 'Moldova', maxLength: 8 },
    '374': { flag: '🇦🇲', name: 'Armenia', maxLength: 8 },
    '375': { flag: '🇧🇾', name: 'Belarus', maxLength: 9 },
    '376': { flag: '🇦🇩', name: 'Andorra', maxLength: 6 },
    '377': { flag: '🇲🇨', name: 'Monaco', maxLength: 8 },
    '378': { flag: '🇸🇲', name: 'San Marino', maxLength: 10 },
    '380': { flag: '🇺🇦', name: 'Ukraine', maxLength: 9 },
    '381': { flag: '🇷🇸', name: 'Serbia', maxLength: 9 },
    '382': { flag: '🇲🇪', name: 'Montenegro', maxLength: 8 },
    '383': { flag: '🇽🇰', name: 'Kosovo', maxLength: 9 },
    '385': { flag: '🇭🇷', name: 'Croatia', maxLength: 9 },
    '386': { flag: '🇸🇮', name: 'Slovenia', maxLength: 8 },
    '387': { flag: '🇧🇦', name: 'Bosnia and Herzegovina', maxLength: 8 },
    '389': { flag: '🇲🇰', name: 'North Macedonia', maxLength: 8 },
    '420': { flag: '🇨🇿', name: 'Czech Republic', maxLength: 9 },
    '421': { flag: '🇸🇰', name: 'Slovakia', maxLength: 9 },
    '423': { flag: '🇱🇮', name: 'Liechtenstein', maxLength: 7 },
    '500': { flag: '🇫🇰', name: 'Falkland Islands', maxLength: 5 },
    '501': { flag: '🇧🇿', name: 'Belize', maxLength: 7 },
    '502': { flag: '🇬🇹', name: 'Guatemala', maxLength: 8 },
    '503': { flag: '🇸🇻', name: 'El Salvador', maxLength: 8 },
    '504': { flag: '🇭🇳', name: 'Honduras', maxLength: 8 },
    '505': { flag: '🇳🇮', name: 'Nicaragua', maxLength: 8 },
    '506': { flag: '🇨🇷', name: 'Costa Rica', maxLength: 8 },
    '507': { flag: '🇵🇦', name: 'Panama', maxLength: 8 },
    '508': { flag: '🇵🇲', name: 'Saint Pierre and Miquelon', maxLength: 6 },
    '509': { flag: '🇭🇹', name: 'Haiti', maxLength: 8 },
    '590': { flag: '🇬🇵', name: 'Guadeloupe', maxLength: 9 },
    '591': { flag: '🇧🇴', name: 'Bolivia', maxLength: 8 },
    '592': { flag: '🇬🇾', name: 'Guyana', maxLength: 7 },
    '593': { flag: '🇪🇨', name: 'Ecuador', maxLength: 9 },
    '594': { flag: '🇬🇫', name: 'French Guiana', maxLength: 9 },
    '595': { flag: '🇵🇾', name: 'Paraguay', maxLength: 9 },
    '596': { flag: '🇲🇶', name: 'Martinique', maxLength: 9 },
    '597': { flag: '🇸🇷', name: 'Suriname', maxLength: 7 },
    '598': { flag: '🇺🇾', name: 'Uruguay', maxLength: 8 },
    '599': { flag: '🇨🇼', name: 'Curacao', maxLength: 7 },
    '670': { flag: '🇹🇱', name: 'East Timor', maxLength: 8 },
    '672': { flag: '🇦🇶', name: 'Antarctica', maxLength: 6 },
    '673': { flag: '🇧🇳', name: 'Brunei', maxLength: 7 },
    '674': { flag: '🇳🇷', name: 'Nauru', maxLength: 7 },
    '675': { flag: '🇵🇬', name: 'Papua New Guinea', maxLength: 8 },
    '676': { flag: '🇹🇴', name: 'Tonga', maxLength: 5 },
    '677': { flag: '🇸🇧', name: 'Solomon Islands', maxLength: 7 },
    '678': { flag: '🇻🇺', name: 'Vanuatu', maxLength: 7 },
    '679': { flag: '🇫🇯', name: 'Fiji', maxLength: 7 },
    '680': { flag: '🇵🇼', name: 'Palau', maxLength: 7 },
    '681': { flag: '🇼🇫', name: 'Wallis and Futuna', maxLength: 6 },
    '682': { flag: '🇨🇰', name: 'Cook Islands', maxLength: 5 },
    '683': { flag: '🇳🇺', name: 'Niue', maxLength: 4 },
    '684': { flag: '🇦🇸', name: 'American Samoa', maxLength: 7 },
    '685': { flag: '🇼🇸', name: 'Samoa', maxLength: 7 },
    '686': { flag: '🇰🇮', name: 'Kiribati', maxLength: 5 },
    '687': { flag: '🇳🇨', name: 'New Caledonia', maxLength: 6 },
    '688': { flag: '🇹🇻', name: 'Tuvalu', maxLength: 5 },
    '689': { flag: '🇵🇫', name: 'French Polynesia', maxLength: 8 },
    '690': { flag: '🇹🇰', name: 'Tokelau', maxLength: 4 },
    '691': { flag: '🇫🇲', name: 'Micronesia', maxLength: 7 },
    '692': { flag: '🇲🇭', name: 'Marshall Islands', maxLength: 7 },
    '850': { flag: '🇰🇵', name: 'North Korea', maxLength: 10 },
    '852': { flag: '🇭🇰', name: 'Hong Kong', maxLength: 8 },
    '853': { flag: '🇲🇴', name: 'Macau', maxLength: 8 },
    '855': { flag: '🇰🇭', name: 'Cambodia', maxLength: 9 },
    '856': { flag: '🇱🇦', name: 'Laos', maxLength: 10 },
    '880': { flag: '🇧🇩', name: 'Bangladesh', maxLength: 10 },
    '886': { flag: '🇹🇼', name: 'Taiwan', maxLength: 9 },
    '960': { flag: '🇲🇻', name: 'Maldives', maxLength: 7 },
    '961': { flag: '🇱🇧', name: 'Lebanon', maxLength: 8 },
    '962': { flag: '🇯🇴', name: 'Jordan', maxLength: 9 },
    '963': { flag: '🇸🇾', name: 'Syria', maxLength: 9 },
    '964': { flag: '🇮🇶', name: 'Iraq', maxLength: 10 },
    '965': { flag: '🇰🇼', name: 'Kuwait', maxLength: 8 },
    '966': { flag: '🇸🇦', name: 'Saudi Arabia', maxLength: 9 },
    '967': { flag: '🇾🇪', name: 'Yemen', maxLength: 9 },
    '968': { flag: '🇴🇲', name: 'Oman', maxLength: 8 },
    '970': { flag: '🇵🇸', name: 'Palestine', maxLength: 9 },
    '971': { flag: '🇦🇪', name: 'United Arab Emirates', maxLength: 9 },
    '972': { flag: '🇮🇱', name: 'Israel', maxLength: 9 },
    '973': { flag: '🇧🇭', name: 'Bahrain', maxLength: 8 },
    '974': { flag: '🇶🇦', name: 'Qatar', maxLength: 8 },
    '975': { flag: '🇧🇹', name: 'Bhutan', maxLength: 8 },
    '976': { flag: '🇲🇳', name: 'Mongolia', maxLength: 8 },
    '977': { flag: '🇳🇵', name: 'Nepal', maxLength: 10 },
    '992': { flag: '🇹🇯', name: 'Tajikistan', maxLength: 9 },
    '993': { flag: '🇹🇲', name: 'Turkmenistan', maxLength: 8 },
    '994': { flag: '🇦🇿', name: 'Azerbaijan', maxLength: 9 },
    '995': { flag: '🇬🇪', name: 'Georgia', maxLength: 9 },
    '996': { flag: '🇰🇬', name: 'Kyrgyzstan', maxLength: 9 },
    '998': { flag: '🇺🇿', name: 'Uzbekistan', maxLength: 9 }
};

// Enhanced auto-detect country from phone number
function detectCountryFromPhoneNumber(phoneNumber) {
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber) return null;

    const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

    for (const code of sortedCodes) {
        if (cleanNumber.startsWith(code)) {
            const country = COUNTRY_CODES[code];
            const nationalNumber = cleanNumber.substring(code.length);

            if (nationalNumber.length >= 3 && nationalNumber.length <= (country.maxLength || 15)) {
                return {
                    countryCode: code,
                    countryInfo: country,
                    nationalNumber: nationalNumber,
                    fullNumber: cleanNumber,
                    e164: `+${cleanNumber}`,
                    isComplete: nationalNumber.length >= 7
                };
            }
        }
    }
    return null;
}

// Phone number validation and normalization
function normalizeToE164(phoneNumber) {
    if (!phoneNumber) {
        return { valid: false, error: 'Phone number is required' };
    }

    const detection = detectCountryFromPhoneNumber(phoneNumber);
    if (!detection) {
        return { valid: false, error: 'Unable to detect country. Please include country code (e.g., 919876543210)' };
    }

    const { countryCode, countryInfo, nationalNumber, e164 } = detection;

    if (nationalNumber.length < 6) {
        return { valid: false, error: 'Phone number too short' };
    }

    if (nationalNumber.length > 15) {
        return { valid: false, error: 'Phone number too long' };
    }

    if (countryInfo.maxLength && nationalNumber.length > countryInfo.maxLength) {
        return { valid: false, error: `Phone number too long for ${countryInfo.name}` };
    }

    return { 
        valid: true, 
        e164, 
        countryCode, 
        nationalNumber,
        country: countryInfo.name,
        detectedCountry: `${countryInfo.flag} ${countryInfo.name} (+${countryCode})`
    };
}

// Show/hide phone error
function showPhoneError(message) {
    if (phoneError) {
        phoneError.textContent = message;
        phoneError.style.display = 'block';
    }
}

function hidePhoneError() {
    if (phoneError) {
        phoneError.style.display = 'none';
    }
}

// Global variables for country detection
let detectedCountry = null;

// Enhanced phone input with smart country detection and animations
function initPhoneInputAnimation() {
    const inputWrapper = pairNumberInput.closest('.input-wrapper');
    if (!inputWrapper) return;

    let countryDisplay = inputWrapper.querySelector('.country-code-display');
    if (!countryDisplay) {
        countryDisplay = document.createElement('div');
        countryDisplay.className = 'country-code-display';
        countryDisplay.innerHTML = `
            <div class="country-badge">
                <span class="country-flag"></span>
                <span class="country-code">+</span>
            </div>
        `;
        inputWrapper.appendChild(countryDisplay);
    }

    const countryFlag = countryDisplay.querySelector('.country-flag');
    const countryCodeSpan = countryDisplay.querySelector('.country-code');
    let lastProcessedValue = '';

    pairNumberInput.addEventListener('focus', () => {
        inputWrapper.classList.add('focused');
        if (detectedCountry) {
            countryDisplay.classList.add('focused');
        }
    });

    pairNumberInput.addEventListener('blur', () => {
        inputWrapper.classList.remove('focused');
        countryDisplay.classList.remove('focused');

        if (!pairNumberInput.value.trim()) {
            resetCountryDisplay();
        }
    });

    function resetCountryDisplay() {
        detectedCountry = null;
        countryDisplay.classList.remove('show', 'detected', 'complete');
        inputWrapper.classList.remove('has-country-code', 'has-value', 'number-complete');
        countryFlag.textContent = '';
        countryCodeSpan.textContent = '+';
        lastProcessedValue = '';
    }

    function smoothSlideAnimation(detection) {
        const { countryCode, countryInfo, isComplete } = detection;

        // Update flag and country code
        countryFlag.textContent = countryInfo.flag || '🌍';
        countryCodeSpan.textContent = `+${countryCode}`;

        // Add smooth slide-in animation
        countryDisplay.classList.add('show', 'detected');
        inputWrapper.classList.add('has-country-code');

        // Add completion styling if number is complete
        if (isComplete) {
            countryDisplay.classList.add('complete');
            inputWrapper.classList.add('number-complete');
        } else {
            countryDisplay.classList.remove('complete');
            inputWrapper.classList.remove('number-complete');
        }

        // Remove detection pulse after animation
        setTimeout(() => {
            countryDisplay.classList.remove('detected');
        }, 600);

        console.log(`🌍 Country detected: ${countryInfo.flag} (+${countryCode})`);
    }

    function cleanAndFormatInput(inputValue) {
        // Remove all non-digits and plus signs
        let cleaned = inputValue.replace(/[^\d+]/g, '');
        
        // Remove multiple plus signs and keep only digits
        cleaned = cleaned.replace(/\+/g, '');
        
        // Extract digits only for processing
        return cleaned.replace(/\D/g, '');
    }

    function updateInputValue(cleanedDigits, detectedCountry) {
        // Update the input field to show only the cleaned digits
        // The country flag will show the country code visually
        if (detectedCountry) {
            const nationalNumber = cleanedDigits.substring(detectedCountry.countryCode.length);
            pairNumberInput.value = cleanedDigits;
        } else {
            pairNumberInput.value = cleanedDigits;
        }
    }

    pairNumberInput.addEventListener('input', (e) => {
        let rawValue = e.target.value;
        let cleanedDigits = cleanAndFormatInput(rawValue);

        // Prevent infinite loops
        if (cleanedDigits === lastProcessedValue) {
            return;
        }
        lastProcessedValue = cleanedDigits;

        if (!cleanedDigits) {
            if (detectedCountry) {
                detectedCountry = null;
                countryDisplay.classList.remove('show', 'detected', 'complete');
                inputWrapper.classList.remove('has-country-code', 'number-complete');
                countryFlag.textContent = '';
                countryCodeSpan.textContent = '+';
            }
            inputWrapper.classList.remove('has-value');
            return;
        }

        inputWrapper.classList.add('has-value');

        // Check for country detection
        const detection = detectCountryFromPhoneNumber(cleanedDigits);

        if (detection) {
            // Update input to show clean number without duplicates
            updateInputValue(cleanedDigits, detection);
            
            // If this is a new country detection or country changed
            if (!detectedCountry || detectedCountry.countryCode !== detection.countryCode) {
                detectedCountry = detection;
                smoothSlideAnimation(detection);
            } else {
                // Same country, just update completion status
                if (detection.isComplete) {
                    countryDisplay.classList.add('complete');
                    inputWrapper.classList.add('number-complete');
                } else {
                    countryDisplay.classList.remove('complete');
                    inputWrapper.classList.remove('number-complete');
                }
            }
        } else {
            // No country detected, clean up
            if (detectedCountry) {
                detectedCountry = null;
                countryDisplay.classList.remove('show', 'detected', 'complete');
                inputWrapper.classList.remove('has-country-code', 'number-complete');
                countryFlag.textContent = '';
                countryCodeSpan.textContent = '+';
            }
            // Still update input to remove any invalid characters
            pairNumberInput.value = cleanedDigits;
        }
    });

    pairNumberInput.addEventListener('paste', (e) => {
        // Handle paste events with a slight delay to process the pasted content
        setTimeout(() => {
            const event = new Event('input', { bubbles: true });
            e.target.dispatchEvent(event);
        }, 10);
    });

    // Handle keydown for better UX - prevent non-numeric input
    pairNumberInput.addEventListener('keydown', (e) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) || 
            (e.keyCode === 67 && e.ctrlKey === true) || 
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        // Ensure that it is a number or plus sign and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
            (e.keyCode < 96 || e.keyCode > 105) && 
            e.keyCode !== 187) { // 187 is + key
            e.preventDefault();
        }
    });
}

// Banlist elements
const refreshBanlistBtn = document.getElementById('refreshBanlistBtn');
const banlistGrid = document.getElementById('banlistGrid');
const banlistLoader = document.getElementById('banlistLoader');
const banlistError = document.getElementById('banlistError');
const banlistEmpty = document.getElementById('banlistEmpty');
const banlistErrorMessage = document.getElementById('banlistErrorMessage');
const retryBanlistBtn = document.getElementById('retryBanlistBtn');
const bannedUserCount = document.getElementById('bannedUserCount');

// Application State
let sessions = [];
let bannedUsers = {};
let isLoading = false;
let isLoadingBanlist = false;

// Enhanced UI Animations
function initEnhancedAnimations() {
    const cards = document.querySelectorAll('.card, .session-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Utility Functions
function showToast(title, message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastText = toast.querySelector('.toast-text');

    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;

    toastTitle.textContent = title;
    toastText.textContent = message;

    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showBanWarningModal(number) {
    const existingModal = document.getElementById('banWarningModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'banWarningModal';
    modal.className = 'pairing-modal-overlay';
    modal.innerHTML = `
        <div class="pairing-modal">
            <div class="pairing-modal-header">
                <h2><i class="fas fa-ban"></i> Number Banned</h2>
                <button class="modal-close" onclick="closeBanWarningModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pairing-modal-content">
                <div class="ban-warning">
                    <div class="ban-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>You Are Banned</h3>
                    <p>Your number <strong>+${number}</strong> has been banned from using this bot.</p>
                    <p>This restriction may be due to:</p>
                    <ul style="text-align: left; margin: 20px 0; padding-left: 20px; color: rgba(255,255,255,0.8);">
                        <li>Violation of terms of service</li>
                        <li>Spam or abusive behavior</li>
                        <li>Security concerns</li>
                        <li>Administrative decision</li>
                    </ul>
                    
                    <div class="contact-info">
                        <h4><i class="fas fa-headset"></i> Need Help?</h4>
                        <p>If you believe this is a mistake or want to appeal this ban, please contact the developer:</p>
                        
                        <div class="contact-actions">
                            <a href="https://chat.whatsapp.com/CQyxExEBMGvEnkA32zqbNY" 
                               target="_blank" 
                               class="btn btn-primary">
                                <i class="fab fa-whatsapp"></i>
                                Contact Developer
                            </a>
                            <button class="btn btn-secondary" onclick="closeBanWarningModal()">
                                <i class="fas fa-times"></i>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showPairingCodeModal(number, code) {
    const existingModal = document.getElementById('pairingModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'pairingModal';
    modal.className = 'pairing-modal-overlay';
    modal.innerHTML = `
        <div class="pairing-modal">
            <div class="pairing-modal-header">
                <h2><i class="fab fa-whatsapp"></i> WhatsApp Pairing Code</h2>
                <button class="modal-close" onclick="closePairingModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pairing-modal-content">
                <div class="pairing-number-card">
                    <div class="phone-icon-wrapper">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="number-text">
                        <span class="label">Phone Number</span>
                        <span class="number">${detectedCountry ? detectedCountry.countryInfo.flag : '🌍'}+${number}</span>
                    </div>
                </div>

                <div class="pairing-code-section">
                    <div class="code-header">
                        <div class="whatsapp-icon">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <h3>Your Pairing Code</h3>
                    </div>

                    <div class="code-display-card">
                        <div class="code-wrapper">
                            <div class="pairing-code-enhanced" id="pairingCode">${code}</div>
                            <div class="code-animation-bg"></div>
                        </div>
                        <button class="copy-btn-enhanced" onclick="copyPairingCode('${code}')">
                            <span class="copy-icon">
                                <i class="fas fa-copy"></i>
                            </span>
                            <span class="copy-text">Copy Code</span>
                            <span class="copied-text">Copied!</span>
                        </button>
                    </div>
                </div>

                <div class="instructions-enhanced">
                    <div class="instruction-header">
                        <i class="fas fa-list-ol"></i>
                        <h3>How to Link Your Device</h3>
                    </div>
                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <i class="fab fa-whatsapp step-icon"></i>
                                <span>Open WhatsApp on your phone</span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <i class="fas fa-cog step-icon"></i>
                                <span>Go to <strong>Settings → Linked Devices</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <i class="fas fa-link step-icon"></i>
                                <span>Tap <strong>"Link a Device"</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <i class="fas fa-phone step-icon"></i>
                                <span>Select <strong>"Link with phone number"</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">5</div>
                            <div class="step-content">
                                <i class="fas fa-keyboard step-icon"></i>
                                <span>Enter the <strong>pairing code</strong> above</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pairing-modal-footer">
                <button class="btn btn-primary" onclick="closePairingModal()">
                    Got it!
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    setTimeout(async () => {
        await loadSessions();
    }, 5000);
}

// Global functions for modals
window.closePairingModal = function() {
    const modal = document.getElementById('pairingModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
    loadSessions();
};

window.closeBanWarningModal = function() {
    const modal = document.getElementById('banWarningModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

window.copyPairingCode = function(code) {
    const copyBtn = document.querySelector('.copy-btn-enhanced');

    copyBtn.classList.add('copying');

    navigator.clipboard.writeText(code).then(() => {
        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2500);
        }, 400);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2500);
        }, 400);
    });
};

function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (loading) {
        btnText.style.opacity = '0';
        btnLoader.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// API Functions with proper error handling
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const textData = await response.text();
            try {
                responseData = JSON.parse(textData);
            } catch {
                responseData = textData;
            }
        }

        if (!response.ok) {
            let errorMessage = 'Unknown error';
            if (responseData && typeof responseData === 'object') {
                errorMessage = responseData.message || responseData.error || response.statusText;
            } else if (typeof responseData === 'string') {
                errorMessage = responseData;
            }
            throw new Error(errorMessage);
        }

        return responseData;

    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

async function pairNumber(number) {
    return await makeApiRequest(`/pair?number=${encodeURIComponent(number)}`);
}

async function getSessions() {
    return await makeApiRequest('/sessions');
}

async function getBanlist() {
    try {
        const response = await makeApiRequest('/banlist');
        return response && typeof response === 'object' ? response : {};
    } catch (error) {
        console.error('Banlist API error:', error);
        return {};
    }
}

// UI Functions
function showSessionsState(state) {
    sessionsLoader.style.display = 'none';
    sessionsError.style.display = 'none';
    sessionsEmpty.style.display = 'none';
    sessionsGrid.style.display = 'none';

    switch (state) {
        case 'loading':
            sessionsLoader.style.display = 'flex';
            break;
        case 'error':
            sessionsError.style.display = 'flex';
            break;
        case 'empty':
            sessionsEmpty.style.display = 'flex';
            break;
        case 'data':
            sessionsGrid.style.display = 'grid';
            break;
    }
}

function createSessionCard(session, index) {
    let number, status, connectedAt, deviceInfo;

    if (typeof session === 'object') {
        number = session.number || session.phone || session.id || `Session ${index + 1}`;
        status = session.status || session.state || 'active';
        connectedAt = session.connectedAt || session.created || session.timestamp;
        deviceInfo = session.device || session.client || session.browser;
    } else {
        number = session.toString();
        status = 'active';
    }

    const card = document.createElement('div');
    card.className = 'session-card';

    let timeText = 'Unknown';
    if (connectedAt) {
        try {
            const date = new Date(connectedAt);
            if (!isNaN(date.getTime())) {
                timeText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
        } catch (e) {
            timeText = connectedAt.toString();
        }
    }

    card.innerHTML = `
        <div class="session-header">
            <div class="session-number">
                <i class="fas fa-phone"></i>
                +${number}
            </div>
            <div class="session-status status-${status.toLowerCase()}">
                ${status}
            </div>
        </div>
        <div class="session-info">
            <div>
                <i class="fas fa-clock"></i>
                <span>Connected: ${timeText}</span>
            </div>
            ${deviceInfo ? `
                <div>
                    <i class="fas fa-mobile-alt"></i>
                    <span>Device: ${deviceInfo}</span>
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

function renderSessions() {
    sessionCount.textContent = sessions.length;

    if (sessions.length === 0) {
        showSessionsState('empty');
        return;
    }

    sessionsGrid.innerHTML = '';

    sessions.forEach((session, index) => {
        const card = createSessionCard(session, index);
        sessionsGrid.appendChild(card);
    });

    showSessionsState('data');
}

async function loadSessions() {
    if (isLoading) return;

    isLoading = true;
    showSessionsState('loading');

    try {
        const response = await getSessions();

        if (Array.isArray(response)) {
            sessions = response;
        } else if (response && typeof response === 'object') {
            sessions = response.active || response.sessions || response.data || response.results || [];
        } else {
            sessions = [];
        }

        renderSessions();

    } catch (error) {
        console.error('Failed to load sessions:', error);
        sessionsErrorMessage.textContent = `Failed to load sessions: ${error.message}`;
        showSessionsState('error');
    } finally {
        isLoading = false;
    }
}

async function loadBanlist() {
    if (isLoadingBanlist) return;

    isLoadingBanlist = true;
    showBanlistState('loading');

    try {
        const response = await getBanlist();
        bannedUsers = response || {};
        renderBanlist();
    } catch (error) {
        console.error('Failed to load banlist:', error);
        banlistErrorMessage.textContent = `Unable to load banned users.`;
        showBanlistState('error');
    } finally {
        isLoadingBanlist = false;
    }
}

function showBanlistState(state) {
    banlistLoader.style.display = 'none';
    banlistError.style.display = 'none';
    banlistEmpty.style.display = 'none';
    banlistGrid.style.display = 'none';

    switch (state) {
        case 'loading':
            banlistLoader.style.display = 'flex';
            break;
        case 'error':
            banlistError.style.display = 'flex';
            break;
        case 'empty':
            banlistEmpty.style.display = 'flex';
            break;
        case 'data':
            banlistGrid.style.display = 'grid';
            break;
    }
}

function renderBanlist() {
    if (!bannedUsers || typeof bannedUsers !== 'object') {
        bannedUsers = {};
    }

    const userNumbers = Object.keys(bannedUsers);

    if (bannedUserCount) {
        bannedUserCount.textContent = userNumbers.length;
    }

    if (userNumbers.length === 0) {
        showBanlistState('empty');
        return;
    }

    if (banlistGrid) {
        banlistGrid.innerHTML = '';

        userNumbers.forEach(number => {
            const card = createBannedUserCard(number);
            banlistGrid.appendChild(card);
        });

        showBanlistState('data');
    }
}

function createBannedUserCard(number) {
    const card = document.createElement('div');
    card.className = 'banned-user-card';
    card.innerHTML = `
        <div class="user-info">
            <div class="user-avatar">
                <i class="fas fa-user-slash"></i>
            </div>
            <div class="user-details">
                <h3 class="user-number">+${number}</h3>
                <span class="user-status">
                    <i class="fas fa-ban"></i>
                    Banned
                </span>
            </div>
        </div>
        <div class="user-actions">
            <span class="banned-label">
                <i class="fas fa-shield-alt"></i>
                Banned User
            </span>
        </div>
    `;
    return card;
}

// Event Handlers
pairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔄 Form submitted');
    hidePhoneError();

    const phoneNumber = pairNumberInput.value.trim();
    console.log('📱 Input value:', phoneNumber);

    if (!phoneNumber) {
        console.log('❌ Empty phone number');
        showPhoneError('Please enter a phone number');
        pairNumberInput.focus();
        return;
    }

    // Normalize the phone number for submission
    let cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    let fullNumber;

    if (detectedCountry && !cleanNumber.startsWith(detectedCountry.countryCode)) {
        // If we detected a country and the number doesn't start with that country code, prepend it
        fullNumber = detectedCountry.countryCode + cleanNumber;
        console.log(`🔗 Full number: ${detectedCountry.countryCode} + ${cleanNumber} = ${fullNumber}`);
    } else {
        // Use the full number as-is (already contains country code or no country detected)
        fullNumber = cleanNumber;
    }

    const validation = normalizeToE164(fullNumber);
    if (!validation.valid) {
        showPhoneError(validation.error);
        pairNumberInput.focus();
        return;
    }

    const number = validation.e164.replace('+', '');
    console.log('Pairing number:', number, 'for', validation.country);

    if (!number || number.length < 10 || number.length > 15) {
        showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
        return;
    }

    const submitBtn = pairForm.querySelector('.btn');
    setButtonLoading(submitBtn, true);

    try {
        const result = await pairNumber(number);

        if (result && result.error) {
            if (result.error.includes('ban') || result.error.includes('blocked')) {
                showBanWarningModal(number);
            } else {
                showToast('Error', result.message || result.error, 'error');
            }
        } else if (result && result.code) {
            showPairingCodeModal(number, result.code);
        } else if (result && result.status === 'already paired') {
            showToast('Already Paired', `Number +${number} is already paired`, 'success');
            await loadSessions();
        } else if (result && result.message) {
            showToast('Success', result.message, 'success');
            await loadSessions();
        } else {
            showToast('Request Sent', 'Pairing request has been sent successfully', 'success');
            await loadSessions();
        }

        // Clear input and reset form
        pairNumberInput.value = '';
        const inputWrapper = pairNumberInput.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.classList.remove('has-country-code', 'has-value', 'focused');
            const countryDisplay = inputWrapper.querySelector('.country-code-display');
            if (countryDisplay) {
                countryDisplay.classList.remove('show');
            }
        }
        detectedCountry = null;

    } catch (error) {
        console.error('Failed to pair number:', error);

        let errorMessage = 'Network error occurred';
        if (error.message) {
            if (error.message.includes('400')) {
                errorMessage = 'Please enter a valid phone number';
            } else if (error.message.includes('404')) {
                errorMessage = 'WhatsApp service is temporarily unavailable';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later';
            } else {
                errorMessage = error.message;
            }
        }

        showToast('Pairing Failed', errorMessage, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});

// Event listeners
if (refreshBtn) refreshBtn.addEventListener('click', loadSessions);
if (headerRefreshBtn) headerRefreshBtn.addEventListener('click', loadSessions);
if (retrySessionsBtn) retrySessionsBtn.addEventListener('click', loadSessions);
if (refreshBanlistBtn) refreshBanlistBtn.addEventListener('click', loadBanlist);
if (retryBanlistBtn) retryBanlistBtn.addEventListener('click', loadBanlist);

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 WhatsApp Bot Management Dashboard - High-DPI Optimized');

    initEnhancedAnimations();
    initPhoneInputAnimation();

    loadSessions();
    loadBanlist();
});

// Auto-refresh
let refreshInterval = setInterval(() => {
    if (!isLoading && !document.hidden) {
        loadSessions();
    }
}, 30000);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isLoading) {
        loadSessions();
    }
});