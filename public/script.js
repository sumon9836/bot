// API Configuration - Using Vercel API routes  
const API_BASE_URL = '/api';

// DOM Elements
const pairForm = document.getElementById('pairForm');
const pairNumberInput = document.getElementById('pairNumber');
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

// 🎯 Smart Country Code Detection
let currentCountryCode = null;
let detectedCountry = null;

function detectCountryCode(value) {
    // Remove any non-digits
    const digits = value.replace(/\D/g, '');
    
    // Try to match country codes (longest first for better accuracy)
    const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
    
    for (const code of sortedCodes) {
        if (digits.startsWith(code)) {
            return {
                code,
                info: COUNTRY_CODES[code],
                remainingNumber: digits.substring(code.length)
            };
        }
    }
    
    return null;
}

// 🌟 Enhanced Phone Input with Smart Country Detection
function initPhoneInputAnimation() {
    const inputWrapper = pairNumberInput.closest('.input-wrapper');
    
    if (!inputWrapper) return;
    
    // Create country code display element if it doesn't exist
    let countryDisplay = inputWrapper.querySelector('.country-code-display');
    if (!countryDisplay) {
        countryDisplay = document.createElement('div');
        countryDisplay.className = 'country-code-display';
        countryDisplay.style.display = 'none';
        inputWrapper.appendChild(countryDisplay);
    }
    
    // Add focus event
    pairNumberInput.addEventListener('focus', () => {
        inputWrapper.classList.add('focused');
    });
    
    // Add blur event
    pairNumberInput.addEventListener('blur', () => {
        // Only remove focused class if there's no value
        if (!pairNumberInput.value.trim()) {
            inputWrapper.classList.remove('focused');
            if (!currentCountryCode) {
                countryDisplay.style.display = 'none';
                countryDisplay.classList.remove('show');
            }
        }
    });
    
    // Add double-click to clear country code
    if (countryDisplay) {
        countryDisplay.addEventListener('click', () => {
            // Reset everything
            currentCountryCode = null;
            detectedCountry = null;
            pairNumberInput.value = '';
            countryDisplay.style.display = 'none';
            countryDisplay.classList.remove('show');
            inputWrapper.classList.remove('has-country-code', 'has-value');
            pairNumberInput.focus();
            console.log('Country code reset - enter full number with country code');
        });
    }
    
    // Smart input processing with improved country detection
    pairNumberInput.addEventListener('input', (e) => {
        let rawValue = e.target.value.replace(/\D/g, ''); // Only allow digits
        
        // Reset if input is empty
        if (rawValue.length === 0) {
            countryDisplay.style.display = 'none';
            countryDisplay.classList.remove('show');
            inputWrapper.classList.remove('has-country-code', 'has-value');
            currentCountryCode = null;
            detectedCountry = null;
            e.target.value = '';
            return;
        }
        
        // If we already have a country code, just update the local number
        if (currentCountryCode) {
            // Validate the local number length
            if (detectedCountry && rawValue.length > detectedCountry.maxLength) {
                e.target.value = rawValue.substring(0, detectedCountry.maxLength);
            } else {
                e.target.value = rawValue;
            }
            inputWrapper.classList.add('has-value');
            return;
        }
        
        // Try to detect country code from the full input
        const detection = detectCountryCode(rawValue);
        
        if (detection) {
            // Country code detected!
            currentCountryCode = detection.code;
            detectedCountry = detection.info;
            
            // Update country code display with animation
            countryDisplay.innerHTML = `${detection.info.flag} +${detection.code}`;
            countryDisplay.style.display = 'block';
            countryDisplay.classList.add('show');
            
            // Update input value to show only the remaining number
            e.target.value = detection.remainingNumber;
            
            // Add classes for styling
            inputWrapper.classList.add('has-country-code', 'focused', 'has-value');
            
            // Add bounce animation to the flag
            countryDisplay.style.animation = 'none';
            setTimeout(() => {
                countryDisplay.style.animation = 'flagBounce 0.6s ease-out';
            }, 10);
            
            // Show success feedback
            console.log(`Country detected: ${detection.info.flag} ${detection.info.name} (+${detection.code})`);
            
            // Validate remaining number length
            if (detection.remainingNumber.length > detection.info.maxLength) {
                // Truncate if too long
                e.target.value = detection.remainingNumber.substring(0, detection.info.maxLength);
            }
        } else {
            // No country code detected, just set the value
            e.target.value = rawValue;
            if (rawValue.length > 0) {
                inputWrapper.classList.add('has-value');
            } else {
                inputWrapper.classList.remove('has-value');
            }
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

// 🎨 Enhanced UI Animations and Micro-interactions
function initEnhancedAnimations() {
    // Add stagger animation to cards
    const cards = document.querySelectorAll('.card, .session-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    
    // Add button ripple effect
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
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover sound effect simulation (visual feedback)
    const interactiveElements = document.querySelectorAll('.btn, .card, .session-card, .input-wrapper');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform || '';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Utility Functions
function validatePhoneNumber(number) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(number.trim());
}

function formatPhoneNumber(number) {
    return number.trim().replace(/\D/g, '');
}

function showToast(title, message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastText = toast.querySelector('.toast-text');
    
    // Reset classes
    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;
    
    // Set content
    toastTitle.textContent = title;
    toastText.textContent = message;
    
    // Set appropriate icon
    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showPairingCodeModal(number, code) {
    // Remove any existing modal
    const existingModal = document.getElementById('pairingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
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
                        <span class="number">+${number}</span>
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
                        <button class="copy-btn-enhanced" onclick="copyPairingCodeEnhanced('${code}')">
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
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Auto refresh sessions after pairing attempt
    setTimeout(async () => {
        await loadSessions();
    }, 5000);
}

function showBanWarningModal(number) {
    // Remove any existing modal
    const existingModal = document.getElementById('banModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'banModal';
    modal.className = 'pairing-modal-overlay';
    modal.innerHTML = `
        <div class="pairing-modal">
            <div class="pairing-modal-header">
                <h2><i class="fas fa-ban"></i> Account Banned</h2>
                <button class="modal-close" onclick="closeBanModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pairing-modal-content">
                <div class="ban-warning">
                    <div class="ban-icon">
                        <i class="fas fa-user-slash"></i>
                    </div>
                    <h3>You Are Banned</h3>
                    <p>The number <strong>+${number}</strong> has been blocked from using this bot.</p>
                    <p>If you believe this is an error, please contact the developer.</p>
                    
                    <div class="contact-info">
                        <h4><i class="fas fa-phone"></i> Need Help?</h4>
                        <p>Contact the developer to resolve this issue or register a new number.</p>
                        <div class="contact-actions">
                            <button class="btn btn-primary" onclick="contactDeveloper()">
                                <i class="fas fa-envelope"></i>
                                Contact Developer
                            </button>
                            <button class="btn btn-secondary" onclick="registerNewNumber()">
                                <i class="fas fa-plus"></i>
                                Register New Number
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pairing-modal-footer">
                <button class="btn btn-secondary" onclick="closeBanModal()">
                    <i class="fas fa-times"></i>
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Global functions for modal
window.closePairingModal = function() {
    const modal = document.getElementById('pairingModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    // Reload sessions when modal is closed
    loadSessions();
};

window.closeBanModal = function() {
    const modal = document.getElementById('banModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

window.contactDeveloper = function() {
    showToast('Contact Info', 'Please contact the developer through the official support channels', 'success');
    // You can modify this to open a contact form, email, or redirect to support
};

window.registerNewNumber = function() {
    closeBanModal();
    // Clear the input field and focus it for new number entry
    pairNumberInput.value = '';
    pairNumberInput.focus();
    showToast('New Number', 'Please enter a different phone number to register', 'success');
};

window.copyPairingCodeEnhanced = function(code) {
    const copyBtn = document.querySelector('.copy-btn-enhanced');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const copyText = copyBtn.querySelector('.copy-text');
    const copiedText = copyBtn.querySelector('.copied-text');
    
    // Add beautiful copying animation
    copyBtn.classList.add('copying');
    copyIcon.style.transform = 'scale(0.7) rotate(360deg)';
    copyIcon.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    // Add sparkle effect to button
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: sparkleEffect 0.6s ease-out;
        pointer-events: none;
    `;
    copyBtn.appendChild(sparkle);
    
    navigator.clipboard.writeText(code).then(() => {
        // Beautiful success animation
        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');
            copyIcon.innerHTML = '<i class="fas fa-check"></i>';
            copyIcon.style.transform = 'scale(1.3) rotate(0deg)';
            
            // Add bounce effect to the code
            const codeElement = document.getElementById('pairingCode');
            codeElement.classList.add('code-copied');
            codeElement.style.animation = 'bounceSuccess 0.8s ease-out';
            
            // Create floating success particles
            for (let i = 0; i < 3; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    top: ${20 + i * 10}%;
                    left: ${40 + i * 20}%;
                    width: 6px;
                    height: 6px;
                    background: #FF69B4;
                    border-radius: 50%;
                    animation: floatUp 1s ease-out ${i * 0.1}s;
                    pointer-events: none;
                `;
                copyBtn.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }
            
            // Reset after animation
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.innerHTML = '<i class="fas fa-copy"></i>';
                copyIcon.style.transform = 'scale(1)';
                codeElement.classList.remove('code-copied');
                codeElement.style.animation = '';
            }, 2500);
        }, 400);
        
        // Remove sparkle
        setTimeout(() => sparkle.remove(), 600);
    }).catch(() => {
        // Fallback with same beautiful animation
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');
            copyIcon.innerHTML = '<i class="fas fa-check"></i>';
            copyIcon.style.transform = 'scale(1.3)';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.innerHTML = '<i class="fas fa-copy"></i>';
                copyIcon.style.transform = 'scale(1)';
            }, 2500);
        }, 400);
        
        setTimeout(() => sparkle.remove(), 600);
    });
};

// Keep the old function for compatibility
window.copyPairingCode = window.copyPairingCodeEnhanced;

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

// API Functions
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
        
        // Handle unauthorized access gracefully for banlist/blocklist
        if (response.status === 401 && (endpoint.includes('blocklist') || endpoint.includes('banlist'))) {
            console.log('Unauthorized access to banlist - requires admin login');
            return {};
        }
        
        // Get response data first
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        // Handle error responses
        if (!response.ok) {
            let errorMessage = 'Unknown error';
            if (responseData && typeof responseData === 'object') {
                errorMessage = responseData.message || responseData.error || response.statusText;
            } else if (typeof responseData === 'string') {
                errorMessage = responseData;
            } else {
                errorMessage = response.statusText;
            }
            throw new Error(`HTTP ${response.status}: ${errorMessage}`);
        }
        
        return responseData;
        
    } catch (error) {
        console.error('API Request failed:', error.message || error);
        
        // For banlist/blocklist requests, return empty object instead of throwing
        if (endpoint.includes('blocklist') || endpoint.includes('banlist')) {
            return {};
        }
        
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
        // Ensure we always return an object
        return response && typeof response === 'object' ? response : {};
    } catch (error) {
        console.error('Banlist API error:', error);
        // Return empty object to handle gracefully
        return {};
    }
}

// UI Functions
function showSessionsState(state) {
    // Hide all states first
    sessionsLoader.style.display = 'none';
    sessionsError.style.display = 'none';
    sessionsEmpty.style.display = 'none';
    sessionsGrid.style.display = 'none';
    
    // Show the requested state
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
    // Handle different possible session data structures
    let number, status, connectedAt, deviceInfo;
    
    if (typeof session === 'object') {
        // If session is an object, extract properties
        number = session.number || session.phone || session.id || `Session ${index + 1}`;
        status = session.status || session.state || 'active';
        connectedAt = session.connectedAt || session.created || session.timestamp;
        deviceInfo = session.device || session.client || session.browser;
    } else {
        // If session is a string or number
        number = session.toString();
        status = 'active';
    }
    
    const card = document.createElement('div');
    card.className = 'session-card';
    
    // Format the connected time
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
        
    `;
    
    return card;
}

function renderSessions() {
    // Update session count
    sessionCount.textContent = sessions.length;
    
    if (sessions.length === 0) {
        showSessionsState('empty');
        return;
    }
    
    // Clear existing sessions
    sessionsGrid.innerHTML = '';
    
    // Create session cards
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
        
        // Handle different response formats
        if (Array.isArray(response)) {
            sessions = response;
        } else if (response && typeof response === 'object') {
            // Your API returns { active: [...], status: {...} }
            sessions = response.active || response.sessions || response.data || response.results || [];
        } else {
            // If response is not what we expect, create empty array
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
        
        if (response && typeof response === 'object') {
            bannedUsers = response;
        } else {
            bannedUsers = {};
        }
        
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
    // Hide all states first
    banlistLoader.style.display = 'none';
    banlistError.style.display = 'none';
    banlistEmpty.style.display = 'none';
    banlistGrid.style.display = 'none';
    
    // Show the requested state
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
    // Handle case where bannedUsers might be null or undefined
    if (!bannedUsers || typeof bannedUsers !== 'object') {
        bannedUsers = {};
    }
    
    const userNumbers = Object.keys(bannedUsers);
    
    // Update banned user count
    if (bannedUserCount) {
        bannedUserCount.textContent = userNumbers.length;
    }
    
    if (userNumbers.length === 0) {
        showBanlistState('empty');
        return;
    }
    
    // Clear existing content
    if (banlistGrid) {
        banlistGrid.innerHTML = '';
        
        // Create cards for each banned user
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
    
    let number = pairNumberInput.value.trim();
    
    // Basic validation first
    if (!number && !currentCountryCode) {
        showToast('Invalid Number', 'Please enter a phone number', 'error');
        return;
    }
    
    // If we have a detected country code, combine it
    if (currentCountryCode && number) {
        number = currentCountryCode + number;
    } else if (currentCountryCode && !number) {
        showToast('Incomplete Number', 'Please enter the remaining digits after the country code', 'error');
        return;
    } else if (!currentCountryCode && number) {
        // Try to detect country code from the entered number
        const detection = detectCountryCode(number);
        if (detection) {
            number = detection.code + detection.remainingNumber;
        }
    }
    
    // Remove any non-digit characters
    number = number.replace(/\D/g, '');
    
    // Validate final number format
    if (!number || number.length < 10 || number.length > 15) {
        showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
        return;
    }
    
    // Additional validation for detected country
    if (currentCountryCode && detectedCountry) {
        const remainingDigits = number.substring(currentCountryCode.length);
        if (remainingDigits.length < 7 || remainingDigits.length > detectedCountry.maxLength) {
            showToast('Invalid Length', `Phone number for ${detectedCountry.name} should have ${detectedCountry.maxLength} digits after country code`, 'error');
            return;
        }
    }
    
    const submitBtn = pairForm.querySelector('.btn');
    setButtonLoading(submitBtn, true);
    
    try {
        const result = await pairNumber(number);
        
        // Handle different response types
        if (result && result.error) {
            // Check if user is banned
            if (result.error.includes('ban') || result.error.includes('blocked')) {
                showBanWarningModal(number);
            } else {
                // Show the specific error message
                showToast('Error', result.message || result.error, 'error');
            }
        }
        // Check if we got a pairing code
        else if (result && result.code) {
            showPairingCodeModal(number, result.code);
        } 
        // Handle different status responses
        else if (result && result.status === 'already paired') {
            showToast('Already Paired', `Number +${number} is already paired`, 'success');
            await loadSessions();
        } 
        else if (result && result.message) {
            showToast('Success', result.message, 'success');
            await loadSessions();
        } 
        else {
            showToast('Request Sent', 'Pairing request has been sent successfully', 'success');
            await loadSessions();
        }
        
        // Clear input and reset country code detection
        pairNumberInput.value = '';
        currentCountryCode = null;
        detectedCountry = null;
        const inputWrapper = pairNumberInput.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.classList.remove('has-country-code', 'has-value', 'focused');
            const countryDisplay = inputWrapper.querySelector('.country-code-display');
            if (countryDisplay) {
                countryDisplay.style.display = 'none';
                countryDisplay.classList.remove('show');
            }
        }
        
    } catch (error) {
        console.error('Failed to pair number:', error);
        
        // Extract meaningful error message
        let errorMessage = 'Network error occurred';
        if (error.message) {
            if (error.message.includes('400')) {
                errorMessage = 'Please enter a valid phone number (10-15 digits)';
            } else if (error.message.includes('404')) {
                errorMessage = 'WhatsApp service is temporarily unavailable';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later';
            } else if (error.message.includes('required')) {
                errorMessage = 'Phone number is required';
            } else {
                errorMessage = error.message.replace('HTTP 400: ', '').replace('HTTP 500: ', '');
            }
        }
        
        showToast('Pairing Failed', errorMessage, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});


// Event listeners for sessions
if (refreshBtn) {
    refreshBtn.addEventListener('click', loadSessions);
}
if (headerRefreshBtn) {
    headerRefreshBtn.addEventListener('click', loadSessions);
}
if (retrySessionsBtn) {
    retrySessionsBtn.addEventListener('click', loadSessions);
}

// Banlist event listeners
if (refreshBanlistBtn) {
    refreshBanlistBtn.addEventListener('click', loadBanlist);
}
if (retryBanlistBtn) {
    retryBanlistBtn.addEventListener('click', loadBanlist);
}

// Input Formatting
pairNumberInput.addEventListener('input', (e) => {
    // Remove any non-digit characters as user types
    e.target.value = e.target.value.replace(/\D/g, '');
});

pairNumberInput.addEventListener('paste', (e) => {
    // Handle paste events to clean up pasted content
    setTimeout(() => {
        e.target.value = e.target.value.replace(/\D/g, '');
    }, 0);
});

// Optimized smooth scroll and entrance animations
function addEntranceAnimations() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Use requestAnimationFrame for smoother animations
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) translateZ(0)';
                    }, index * 80);
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) translateZ(0)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.willChange = 'transform, opacity';
        observer.observe(card);
    });
}

// Enhanced toast with better animations
function showToast(title, message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastText = toast.querySelector('.toast-text');
    
    // Reset classes
    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;
    
    // Set content
    toastTitle.textContent = title;
    toastText.textContent = message;
    
    // Set appropriate icon with animation
    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast with bounce effect
    toast.classList.add('show');
    
    // Add a subtle shake effect for errors
    if (type === 'error') {
        toast.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            toast.style.animation = '';
        }, 500);
    }
    
    // Hide after 4 seconds with smooth transition
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Add animations for country code detection and errors
const animationKeyframes = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes flagBounce {
        0% { 
            transform: scale(0.3) translateY(20px);
            opacity: 0;
        }
        50% { 
            transform: scale(1.1) translateY(-5px);
            opacity: 0.8;
        }
        100% { 
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
    
    .country-code-display {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #25D366, #128C7E);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .country-code-display.show {
        opacity: 1;
    }
    
    .input-wrapper.has-country-code input {
        padding-left: 100px;
    }
    
    .input-wrapper.has-country-code .input-icon {
        opacity: 0.3;
    }
`;

// Inject animations
if (!document.getElementById('country-animations')) {
    const style = document.createElement('style');
    style.id = 'country-animations';
    style.textContent = animationKeyframes;
    document.head.appendChild(style);
}

// Smooth scroll to sections
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 WhatsApp Bot Management Dashboard - Railay Inspired Design Initialized');

    // Initialize enhanced animations and phone input
    initEnhancedAnimations();
    initPhoneInputAnimation();
    
    // Add entrance animations
    setTimeout(addEntranceAnimations, 100);
    
    // Load sessions and banlist
    loadSessions();
    loadBanlist();
    
    // Add smooth scrolling to refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            smoothScrollTo('sessions-section');
        });
    }
});

// Optimized auto-refresh with better performance
let refreshInterval;

function startAutoRefresh() {
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        if (!isLoading && !document.hidden) {
            loadSessions();
        }
    }, 30000);
}

// Start auto-refresh
startAutoRefresh();

// Handle visibility change to refresh when tab becomes active
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isLoading) {
        loadSessions();
    }
});
