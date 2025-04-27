/**
 * Torchlight Infinite DPS Calculator
 * 
 * This calculator follows the game's damage formula:
 * damage = Base Damage × (1 + all damage increase percentages) × (1 + additional damage increase percentage 1) × ...
 */

// Variables to store reference values
let referenceDPS = 0;
let referenceActive = false;

// Save all calculator values to localStorage
function saveCalculatorValues() {
    const inputs = document.querySelectorAll('input');
    const savedValues = {};
    
    // Save all input values
    inputs.forEach(input => {
        savedValues[input.id] = input.value;
    });
    
    // Save reference state if active
    if (referenceActive) {
        savedValues['referenceActive'] = true;
        savedValues['referenceDPS'] = referenceDPS;
    }
    
    // Store in localStorage
    localStorage.setItem('torchlightDPSCalculator', JSON.stringify(savedValues));
}

// Load calculator values from localStorage
function loadCalculatorValues() {
    const savedData = localStorage.getItem('torchlightDPSCalculator');
    
    if (savedData) {
        const savedValues = JSON.parse(savedData);
        
        // Restore input values
        Object.keys(savedValues).forEach(key => {
            if (key !== 'referenceActive' && key !== 'referenceDPS') {
                const inputElement = document.getElementById(key);
                if (inputElement) {
                    inputElement.value = savedValues[key];
                }
            }
        });
        
        // Restore reference if it was active
        if (savedValues.referenceActive) {
            referenceActive = true;
            referenceDPS = parseFloat(savedValues.referenceDPS);
            
            // Update UI for comparison mode
            document.getElementById('dpsCompare').style.display = 'block';
            document.getElementById('setReferenceBtn').style.display = 'none';
            document.getElementById('cancelReferenceBtn').style.display = 'inline-block';
            
            // Display reference DPS
            document.getElementById('dpsReference').textContent = referenceDPS.toFixed(2);
        }
        
        // Recalculate DPS with loaded values
        calculateDPS();
    }
}

// Calculate DPS when button is clicked
function calculateDPS() {
    // Get base stats input values
    const baseDamage = parseFloat(document.getElementById('baseDamage').value) || 0;
    const flatAddedDamage = parseFloat(document.getElementById('flatAddedDamage').value) || 0;
    const damageEffectiveness = parseFloat(document.getElementById('damageEffectiveness').value) || 100;
    const attackSpeed = parseFloat(document.getElementById('attackSpeed').value) || 0;
    
    // Get damage multipliers
    const mainStat = parseFloat(document.getElementById('mainStat').value) || 0;
    const damageIncrease = parseFloat(document.getElementById('damageIncrease').value) || 0;
    const lifeMultiplier = parseFloat(document.getElementById('lifeMultiplier').value) || 0;
    const doubleDamageChance = parseFloat(document.getElementById('doubleDamageChance').value) || 0;
    
    // Get penetration values
    const spellPenetration = parseFloat(document.getElementById('spellPenetration').value) || 0;
    const armorPenetration = parseFloat(document.getElementById('armorPenetration').value) || 0;
    
    // Get critical hit values
    const critChance = parseFloat(document.getElementById('critChance').value) || 0;
    const critMultiplier = parseFloat(document.getElementById('critMultiplier').value) || 100;
    
    // Calculate effective flat added damage based on skill's effectiveness
    const effectiveFlatDamage = flatAddedDamage * (damageEffectiveness / 100);
    
    // Calculate total base damage (base + effective flat added)
    const totalBaseDamage = baseDamage + effectiveFlatDamage;
    
    // Calculate damage with buckets according to Torchlight Infinite formula
    // damage = Base Damage × (1 + all damage increase percentages) × (1 + additional damage increase percentage 1) × ...
    
    // Bucket 1: All % damage increases
    const damageIncreaseMult = 1 + (damageIncrease / 100);
    
    // Bucket 2: Main stat (0.5% per point)
    const mainStatMult = 1 + (mainStat * 0.5 / 100);
    
    // Bucket 3: Additional damage to life
    const lifeDamageMult = 1 + (lifeMultiplier / 100);
    
    // Bucket 4: Spell penetration
    const spellPenMult = 1 + (spellPenetration / 100);
    
    // Bucket 5: Armor penetration
    const armorPenMult = 1 + (armorPenetration / 100);
    
    // Calculate base hit damage with all multipliers
    const damagePerHit = totalBaseDamage * damageIncreaseMult * mainStatMult * 
                         lifeDamageMult * spellPenMult * armorPenMult;
    
    // Cap crit chance and double damage chance at 100%
    const effectiveCritChance = Math.min(critChance, 100);
    const effectiveDoubleDamageChance = Math.min(doubleDamageChance, 100);
    
    // Calculate average damage considering critical hits and double damage
    // Critical hit multiplier (e.g., 150% = 1.5x damage)
    const critMultiplierFactor = critMultiplier / 100;
    
    // Calculate average damage with critical hits
    let avgDamageWithCrits = damagePerHit * (1 + (effectiveCritChance / 100) * (critMultiplierFactor - 1));
    
    // Apply double damage chance (each hit has X% chance to deal 2x damage)
    const avgDamagePerHit = avgDamageWithCrits * (1 + (effectiveDoubleDamageChance / 100));
    
    // Calculate DPS
    const totalDPS = avgDamagePerHit * attackSpeed;
    
    // Display the result
    document.getElementById('dpsResult').textContent = totalDPS.toFixed(2);
    
    // If reference mode is active, update the comparison
    if (referenceActive) {
        updateComparison(totalDPS);
    }
    
    // Save values to localStorage
    saveCalculatorValues();
    
    return totalDPS;
}

// Set current values as reference
function setReference() {
    // Calculate and store the current DPS as reference
    referenceDPS = calculateDPS();
    referenceActive = true;
    
    // Update UI for comparison mode
    document.getElementById('dpsCompare').style.display = 'block';
    document.getElementById('setReferenceBtn').style.display = 'none';
    document.getElementById('cancelReferenceBtn').style.display = 'inline-block';
    
    // Display reference DPS
    document.getElementById('dpsReference').textContent = referenceDPS.toFixed(2);
    
    // Initialize comparison
    updateComparison(referenceDPS);
    
    // Save state to localStorage
    saveCalculatorValues();
}

// Cancel reference comparison
function cancelReference() {
    referenceActive = false;
    
    // Update UI to hide comparison
    document.getElementById('dpsCompare').style.display = 'none';
    document.getElementById('setReferenceBtn').style.display = 'inline-block';
    document.getElementById('cancelReferenceBtn').style.display = 'none';
    
    // Save state to localStorage
    saveCalculatorValues();
}

// Update the comparison display
function updateComparison(currentDPS) {
    const dpsChange = currentDPS - referenceDPS;
    const percentChange = (dpsChange / referenceDPS) * 100;
    
    // Format the display with + or - sign and colors
    const changeElement = document.getElementById('dpsChange');
    
    // Format with sign, value and percentage
    let displayText = '';
    if (dpsChange >= 0) {
        displayText = `+${dpsChange.toFixed(2)} (${percentChange.toFixed(2)}%)`;
        changeElement.style.color = '#4CAF50'; // Green for positive
    } else {
        displayText = `${dpsChange.toFixed(2)} (${percentChange.toFixed(2)}%)`;
        changeElement.style.color = '#F44336'; // Red for negative
    }
    
    changeElement.textContent = displayText;
}

// Initialize calculator on page load
window.onload = function() {
    // Load saved values
    loadCalculatorValues();
    
    // If no saved values, calculate with defaults
    if (!localStorage.getItem('torchlightDPSCalculator')) {
        calculateDPS();
    }
};

// Add event listeners to recalculate when inputs change
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateDPS);
    });
});

// Calculate initial DPS on page load
window.onload = calculateDPS;

// Add event listeners to recalculate when inputs change
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateDPS);
    });
});

// Calculate initial DPS on page load
window.onload = calculateDPS;

// Add event listeners to recalculate when inputs change
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateDPS);
    });
});