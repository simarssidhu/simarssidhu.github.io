const baseTemplates = [
    {
        id: 1,
        category: "Cardiology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 50, // 50-70
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            bp: () => `${Math.floor(Math.random() * 20) + 135}/${Math.floor(Math.random() * 15) + 85}`, // 135-155 / 85-100
            hr: () => Math.floor(Math.random() * 20) + 85 // 85-105
        },
        text: "A {age}-year-old {gender} presents to the emergency department with crushing substernal chest pain that radiates to {possessive} left arm. {subj} is diaphoretic and short of breath. Blood pressure is {bp} mmHg and heart rate is {hr} bpm. His ECG shows ST-segment elevation in leads V2-V4. What is the most appropriate immediate next step in management?",
        options: [
            { text: "Administer sublingual nitroglycerin", isCorrect: false, explanation: "While nitroglycerin can help relieve anginal pain, it does not address the underlying thrombosis causing an acute STEMI and is not the definitive next step compared to antiplatelets." },
            { text: "Administer aspirin 160-325 mg chewed", isCorrect: true, explanation: "Immediate administration of chewed aspirin is critical in the management of an acute myocardial infarction to inhibit further platelet aggregation." },
            { text: "Schedule for an outpatient exercise stress test", isCorrect: false, explanation: "An exercise stress test is contraindicated in acute STEMI." },
            { text: "Administer high-dose statin therapy", isCorrect: false, explanation: "While statins are indicated for secondary prevention, they are not the most critical immediate step in an acute STEMI presentation." },
            { text: "Reassure the patient and discharge with NSAIDs", isCorrect: false, explanation: "This patient is having an acute anterior STEMI, which is a life-threatening emergency. Discharge is highly inappropriate." }
        ]
    },
    {
        id: 2,
        category: "Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 18, // 18-30
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            relation: () => getRandomElement(['roommate', 'partner', 'brother', 'sister']),
            amount: () => ((Math.floor(Math.random() * 9) + 8) * 500).toLocaleString() // $4,000 - $8,000 in clean $500 steps
        },
        text: "A {age}-year-old {gender} is brought to the clinic by {possessive} {relation}. The {relation} reports that the patient has not slept for 4 days, has been speaking rapidly, and has spent over ${amount} on unnecessary online purchases. The patient states {subj} is 'on the verge of curing cancer.' What is the most likely diagnosis?",
        options: [
            { text: "Major Depressive Disorder", isCorrect: false, explanation: "The patient is exhibiting symptoms of mania (grandiosity, lack of sleep, spending), not depression." },
            { text: "Schizophrenia", isCorrect: false, explanation: "While grandiosity can be present in schizophrenia, the acute onset of decreased need for sleep, rapid speech, and impulsivity strongly points to a mood disorder." },
            { text: "Bipolar I Disorder, manic episode", isCorrect: true, explanation: "A manic episode is characterized by elevated/expansive mood, grandiosity, decreased need for sleep, pressured speech, and excessive involvement in activities with high potential for painful consequences (e.g., spending sprees) lasting at least 1 week." },
            { text: "Bipolar II Disorder, hypomanic episode", isCorrect: false, explanation: "Hypomania does not cause marked impairment in social or occupational functioning. Severe impairment, such as spending ${amount} impulsively or having grandiose delusions, defines mania rather than hypomania." },
            { text: "Substance-induced mood disorder", isCorrect: false, explanation: "While possible and must be ruled out with a tox screen, Bipolar I is the classic clinical presentation described." }
        ]
    },
    {
        id: 3,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 4) + 2, // 2-5 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl',
            parent: () => Math.random() > 0.5 ? 'mother' : 'father'
        },
        text: "A {age}-year-old {gender} is brought to the pediatrician due to a rash. {possessiveCap} {parent} notes {subj} had a fever and a 'slapped cheek' appearance a few days ago. Now {subj} has a lacy, reticular rash on {possessive} trunk and extremities. What is the most likely causative agent?",
        options: [
            { text: "Measles virus", isCorrect: false, explanation: "Measles typically presents with cough, coryza, conjunctivitis, Koplik spots, and a maculopapular rash that starts on the face and spreads downward." },
            { text: "Human herpesvirus 6", isCorrect: false, explanation: "HHV-6 causes Roseola infantum, characterized by several days of high fever followed by a rash that appears as the fever breaks." },
            { text: "Parvovirus B19", isCorrect: true, explanation: "Parvovirus B19 causes Erythema Infectiosum (Fifth Disease), characterized by a 'slapped cheek' facial rash followed by a lacy, reticular rash on the body." },
            { text: "Streptococcus pyogenes", isCorrect: false, explanation: "S. pyogenes causes Scarlet fever, which presents with a 'sandpaper' rash, strawberry tongue, and pharyngitis." },
            { text: "Varicella-zoster virus", isCorrect: false, explanation: "Varicella-zoster causes chickenpox, characterized by a highly pruritic vesicular rash in various stages of healing (crops)." }
        ]
    },
    {
        id: 4,
        category: "Obstetrics",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 22, // 22-37
            weeks: () => Math.floor(Math.random() * 4) + 34, // 34-37 weeks
            systolic: () => Math.floor(Math.random() * 20) + 150, // 150-170
            diastolic: () => Math.floor(Math.random() * 15) + 100 // 100-115
        },
        text: "A {age}-year-old woman, G1P0, at {weeks} weeks gestation presents with a blood pressure of {systolic}/{diastolic} mmHg, headache, and visual changes. Urinalysis shows 3+ protein. What is the definitive treatment for her condition?",
        options: [
            { text: "Intravenous labetalol", isCorrect: false, explanation: "Labetalol is used for acute blood pressure control but does not cure the underlying pathophysiology of preeclampsia." },
            { text: "Magnesium sulfate", isCorrect: false, explanation: "Magnesium sulfate is used for seizure prophylaxis in severe preeclampsia, but it is not the definitive cure." },
            { text: "Delivery of the fetus and placenta", isCorrect: true, explanation: "The patient has severe preeclampsia. The only definitive treatment for preeclampsia is delivery to resolve the placental dysfunction." },
            { text: "Strict bed rest", isCorrect: false, explanation: "Bed rest alone is not sufficient management for severe preeclampsia and may increase the risk of venous thromboembolism." },
            { text: "Oral nifedipine", isCorrect: false, explanation: "Like labetalol, nifedipine is for blood pressure control, not a definitive cure." }
        ]
    },
    {
        id: 5,
        category: "Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 25) + 40, // 40-65
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            temp: () => (Math.random() * 1.5 + 38.5).toFixed(1) // 38.5 - 40.0 °C
        },
        text: "A {age}-year-old {gender} presents to the emergency department with severe right upper quadrant pain, a temperature of {temp}°C, and scleral icterus. What is this triad called, and what does it suggest?",
        options: [
            { text: "Murphy's triad; acute cholecystitis", isCorrect: false, explanation: "Murphy's sign is associated with acute cholecystitis, but it is not a triad. Acute cholecystitis typically lacks jaundice." },
            { text: "Charcot's triad; acute cholangitis", isCorrect: true, explanation: "Charcot's triad consists of right upper quadrant pain, fever, and jaundice, and it is highly suggestive of acute cholangitis (infection of the biliary tract)." },
            { text: "Reynolds' pentad; acute pancreatitis", isCorrect: false, explanation: "Reynolds' pentad adds hypotension and altered mental status to Charcot's triad, indicating severe ascending cholangitis." },
            { text: "Virchow's triad; deep vein thrombosis", isCorrect: false, explanation: "Virchow's triad relates to factors contributing to venous thrombosis (stasis, hypercoagulability, endothelial injury)." },
            { text: "Beck's triad; cardiac tamponade", isCorrect: false, explanation: "Beck's triad consists of hypotension, jugular venous distension, and muffled heart sounds, suggestive of cardiac tamponade." }
        ]
    },
    {
        id: 6,
        category: "Internal Medicine",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 18, // 18-33
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            glucose: () => Math.floor(Math.random() * 10) + 25, // 25-35 mmol/L
            ph: () => (Math.random() * 0.15 + 7.1).toFixed(2) // 7.10 - 7.25
        },
        text: "A {age}-year-old {gender} with a history of Type 1 Diabetes is brought to the clinic complaining of abdominal pain, nausea, and deep, rapid breathing. Serum glucose is {glucose} mmol/L, arterial pH is {ph}, and urinalysis is positive for ketones. What is the most appropriate initial intravenous fluid management?",
        options: [
            { text: "0.9% Normal Saline (0.9% NaCl) infusion", isCorrect: true, explanation: "The initial step in managing Diabetic Ketoacidosis (DKA) is aggressive fluid resuscitation with 0.9% normal saline to restore intravascular volume." },
            { text: "5% Dextrose in Water (D5W) infusion", isCorrect: false, explanation: "D5W is not used initially. Dextrose should only be added to IV fluids once blood glucose falls below ~14 mmol/L to prevent hypoglycemia while continuing insulin therapy." },
            { text: "Sodium bicarbonate infusion", isCorrect: false, explanation: "Bicarbonate therapy is not indicated unless the arterial pH is extremely low (<6.9) because rapid correction can cause paradoxal CNS acidosis." },
            { text: "Lactated Ringer's solution", isCorrect: false, explanation: "Although Lactated Ringer's is a balanced crystalloid, 0.9% Normal Saline is the standard initial fluid for volume resuscitation in DKA." },
            { text: "Immediate IV bolus of long-acting insulin", isCorrect: false, explanation: "Insulin management in DKA requires continuous low-dose intravenous infusion of short-acting insulin, not a bolus of long-acting insulin, and volume expansion must be initiated first." }
        ]
    },
    {
        id: 7,
        category: "Ethics & Legal",
        vars: {
            age: () => Math.floor(Math.random() * 10) + 15, // 15-24
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} patient requests testing for sexually transmitted infections (STIs) but explicitly asks that {possessive} parents not be informed under any circumstances. Under Canadian law and professional ethics, what is the most appropriate response?",
        options: [
            { text: "Provide the testing confidentially, as the patient exhibits capacity to consent.", isCorrect: true, explanation: "Under the 'Mature Minor' doctrine in Canada, a minor who demonstrates sufficient intelligence and understanding to fully appreciate the nature and consequences of a medical treatment has the capacity to consent, and their confidentiality must be respected." },
            { text: "Refuse testing until a parent or legal guardian provides signed consent.", isCorrect: false, explanation: "Refusing care based solely on age is incorrect and violates the mature minor principle." },
            { text: "Provide the testing but inform the parents afterward for safety reasons.", isCorrect: false, explanation: "Disclosing confidential medical info to parents without a mature minor's consent is a major breach of privacy and confidentiality." },
            { text: "Contact child protective services immediately.", isCorrect: false, explanation: "Requesting an STI test is a standard medical request and is not a grounds for a child welfare report unless abuse is suspected." },
            { text: "Provide testing only if the patient agrees to bring a parent to the follow-up.", isCorrect: false, explanation: "Coercing a mature minor into parental involvement violates the principle of autonomy and clinical confidentiality." }
        ]
    },
    {
        id: 8,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 3) + 3, // 3-5 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl',
            temp: () => (Math.random() * 1.0 + 39.0).toFixed(1) // 39.0 - 40.0 °C
        },
        text: "A {age}-year-old {gender} is brought to the emergency department in respiratory distress. The patient is sitting forward, leaning on {possessive} hands, drooling, and has a temperature of {temp}°C. What is the most appropriate immediate action?",
        options: [
            { text: "Examine the throat immediately using a tongue depressor", isCorrect: false, explanation: "Attempting to inspect the throat in a patient with suspected acute epiglottitis can trigger laryngospasm and complete airway obstruction. It is strictly contraindicated." },
            { text: "Secure the airway in a controlled environment (e.g., OR) with anesthesia present", isCorrect: true, explanation: "The presentation is classic for acute epiglottitis. The absolute priority is securing the airway under controlled conditions with expert personnel ready for emergent intubation or tracheostomy." },
            { text: "Obtain a neck radiograph (lateral view) to look for the 'thumbprint sign'", isCorrect: false, explanation: "While a lateral neck X-ray shows the thumbprint sign, imaging should never delay airway stabilization in a patient with active respiratory distress." },
            { text: "Administer intramuscular epinephrine", isCorrect: false, explanation: "IM epinephrine is for anaphylaxis, not epiglottitis. Nebulized epinephrine can be used for croup but will not resolve epiglottitis." },
            { text: "Initiate high-dose oral corticosteroids and send home", isCorrect: false, explanation: "Epiglottitis is a life-threatening bacterial emergency requiring hospitalization and airway protection. Sending the patient home is highly dangerous." }
        ]
    },
    {
        id: 9,
        category: "Nephrology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 65, // 65-85
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            bun: () => Math.floor(Math.random() * 15) + 20, // 20-35 mmol/L
            cr: () => Math.floor(Math.random() * 50) + 150 // 150-200 umol/L
        },
        text: "A {age}-year-old {gender} with a history of severe gastroenteritis presents with oliguria, dry mucous membranes, and skin tenting. Lab results reveal a Blood Urea Nitrogen (BUN) of {bun} mmol/L and serum creatinine of {cr} umol/L. The fractional excretion of sodium (FeNa) is calculated to be <1%. What is the most likely diagnosis?",
        options: [
            { text: "Acute Tubular Necrosis (ATN)", isCorrect: false, explanation: "ATN is an intrinsic kidney injury. It typically presents with a FeNa >2% and muddy brown casts in the urine." },
            { text: "Prerenal Acute Kidney Injury (Azotemia)", isCorrect: true, explanation: "Prerenal AKI is caused by renal hypoperfusion (in this case, dehydration from gastroenteritis). It is characterized by dry membranes, a high BUN/Creatinine ratio, and a FeNa <1% as the kidneys actively reabsorb sodium." },
            { text: "Postrenal Acute Kidney Injury (Obstruction)", isCorrect: false, explanation: "Postrenal AKI is caused by urinary tract obstruction (e.g., BPH or kidney stones). It does not present with volume depletion and FeNa <1%." },
            { text: "Acute Interstitial Nephritis (AIN)", isCorrect: false, explanation: "AIN is typically an allergic reaction (often drug-induced) presenting with fever, rash, and eosinophiluria." },
            { text: "Glomerulonephritis", isCorrect: false, explanation: "Glomerulonephritis presents with hematuria (dysmorphic RBCs, RBC casts), hypertension, and edema, rather than volume contraction." }
        ]
    },
    {
        id: 10,
        category: "Obstetrics",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 20, // 20-31
            hcg: () => Math.floor(Math.random() * 2000) + 1500 // 1500-3500 mIU/mL
        },
        text: "A {age}-year-old woman presents to the emergency department with sharp unilateral lower abdominal pain and light vaginal bleeding. Her last menstrual period was 6 weeks ago. Serum beta-hCG is {hcg} mIU/mL. Transvaginal ultrasound shows an empty uterus with a small complex adnexal mass. What is the most likely diagnosis?",
        options: [
            { text: "Normal intrauterine pregnancy", isCorrect: false, explanation: "At beta-hCG levels above the discriminatory zone (>1500-2000 mIU/mL), a gestational sac should be visible in the uterus on a transvaginal ultrasound. An empty uterus points away from a normal pregnancy." },
            { text: "Ectopic pregnancy", isCorrect: true, explanation: "The clinical presentation of unilateral pain, bleeding, empty uterus, adnexal mass, and beta-hCG above the discriminatory zone is highly suggestive of an ectopic pregnancy." },
            { text: "Ovarian cyst rupture", isCorrect: false, explanation: "While a ruptured cyst causes unilateral pain, it would not explain a positive pregnancy test with a beta-hCG of {hcg} mIU/mL." },
            { text: "Molar pregnancy", isCorrect: false, explanation: "Molar pregnancy typically presents with extremely elevated beta-hCG levels (often >100,000 mIU/mL) and a classic 'snowstorm' pattern inside the uterus on ultrasound." },
            { text: "Threatened abortion", isCorrect: false, explanation: "Threatened abortion presents with vaginal bleeding, but ultrasound would show an intact intrauterine gestational sac with fetal cardiac activity." }
        ]
    },
    {
        id: 11,
        category: "Neurology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 55, // 55-75
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            hours: () => getRandomElement([2, 3]) // 2 or 3 hours
        },
        text: "A {age}-year-old {gender} is brought to the emergency department by emergency services. {possessiveCap} family reports acute onset of right-sided facial drooping, slurred speech, and severe weakness in {possessive} right arm and leg that began {hours} hours ago. A non-contrast head CT scan shows no evidence of hemorrhage. What is the most appropriate next step in management?",
        options: [
            { text: "Administer intravenous tissue plasminogen activator (tPA)", isCorrect: true, explanation: "The patient is presenting with an acute ischemic stroke. In the absence of hemorrhage on CT and within the 3.0 to 4.5-hour therapeutic window, IV thrombolytic therapy (tPA) is the treatment of choice." },
            { text: "Administer high-dose intravenous heparin", isCorrect: false, explanation: "Heparin is not indicated in the acute management of ischemic stroke and increases the risk of intracranial hemorrhage." },
            { text: "Initiate oral aspirin therapy and arrange discharge", isCorrect: false, explanation: "While aspirin is indicated for secondary prevention, acute stroke requires emergency hospitalization. Aspirin should be delayed 24 hours if tPA is administered." },
            { text: "Schedule an outpatient magnetic resonance imaging (MRI)", isCorrect: false, explanation: "Acute stroke management is time-sensitive. Outpatient workup is highly inappropriate." },
            { text: "Administer aggressive intravenous antihypertensive therapy to lower BP to 120/80 mmHg", isCorrect: false, explanation: "In acute ischemic stroke, permissive hypertension (up to 220/120 mmHg) is allowed to maintain penumbral perfusion unless tPA is given (in which case BP must be kept <185/110 mmHg)." }
        ]
    },
    {
        id: 12,
        category: "Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 15, // 15-30
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 12-hour history of abdominal pain that began around the umbilicus and has since localized to the right lower quadrant. {subjCap} is febrile and reports anorexia and nausea. On physical exam, there is severe tenderness at McBurney's point. What is the most appropriate next diagnostic or therapeutic step?",
        options: [
            { text: "Emergency surgical consult for laparoscopic appendectomy", isCorrect: true, explanation: "The clinical presentation is highly classic for acute appendicitis (periumbilical migrating pain, RLQ localization, anorexia, McBurney's tenderness). In a classic presentation, clinical diagnosis is sufficient, and urgent appendectomy is the gold-standard treatment." },
            { text: "Obtain an abdominal X-ray (KUB)", isCorrect: false, explanation: "An abdominal X-ray has low sensitivity and specificity for appendicitis and is rarely helpful, except to rule out free air from perforation." },
            { text: "Discharge the patient with oral antibiotics and follow-up in 48 hours", isCorrect: false, explanation: "Acute appendicitis is a surgical emergency due to the risk of rupture, peritonitis, and sepsis. Discharge is highly inappropriate." },
            { text: "Order an outpatient colonoscopy", isCorrect: false, explanation: "Colonoscopy is contraindicated in acute appendicitis due to the high risk of perforation." },
            { text: "Initiate high-dose intravenous loop diuretics", isCorrect: false, explanation: "Diuretics play no role in the management of appendicitis, which is an obstructive inflammatory condition." }
        ]
    },
    {
        id: 13,
        category: "Pulmonology",
        vars: {
            age: () => Math.floor(Math.random() * 25) + 40, // 40-65
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            temp: () => (Math.random() * 1.2 + 38.4).toFixed(1), // 38.4 - 39.6 °C
            rr: () => Math.floor(Math.random() * 6) + 20 // 20-26 breaths/min
        },
        text: "A {age}-year-old {gender} presents with a 3-day history of productive cough, rust-colored sputum, a temperature of {temp}°C, and right-sided pleuritic chest pain. On physical exam, there is dullness to percussion and increased tactile fremitus in the right lower lung field. Respiratory rate is {rr} breaths/min. What is the most likely causative pathogen and the appropriate empiric outpatient treatment?",
        options: [
            { text: "Streptococcus pneumoniae; Amoxicillin (or Macrolide)", isCorrect: true, explanation: "Rust-colored sputum and lobar consolidation (dullness, increased fremitus) are classic for Streptococcus pneumoniae (pneumococcus). For mild CAP in healthy individuals, high-dose amoxicillin or macrolides are appropriate empiric outpatient options." },
            { text: "Mycoplasma pneumoniae; Penicillin G", isCorrect: false, explanation: "Mycoplasma causes atypical pneumonia ('walking pneumonia') presenting with diffuse infiltrates, not lobar consolidation. Furthermore, Mycoplasma lacks a cell wall, making beta-lactams like Penicillin G entirely ineffective." },
            { text: "Pneumocystis jirovecii; Trimethoprim-sulfamethoxazole (TMP-SMX)", isCorrect: false, explanation: "Pneumocystis typically affects severely immunocompromised individuals (like HIV/AIDS patients with CD4 < 200) and presents with subacute progressive dyspnea and bilateral interstitial infiltrates." },
            { text: "Klebsiella pneumoniae; Ciprofloxacin", isCorrect: false, explanation: "Klebsiella classically affects alcoholics or individuals with chronic lung disease and presents with 'currant jelly' sputum, but S. pneumoniae is far more common overall in the outpatient setting." },
            { text: "Influenza A virus; Oseltamivir", isCorrect: false, explanation: "While influenza can present with fever and cough, the focal consolidation findings (dullness, tactile fremitus) and rust-colored sputum strongly indicate bacterial lobar pneumonia." }
        ]
    },
    {
        id: 14,
        category: "Endocrinology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 50, // 50-70
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            calcium: () => (Math.random() * 0.2 + 2.65).toFixed(2), // 2.65 - 2.85 mmol/L (Normal 2.15-2.60)
            pth: () => Math.floor(Math.random() * 30) + 75 // 75 - 105 pg/mL (Normal 10-65)
        },
        text: "A {age}-year-old {gender} is found to have asymptomatic hypercalcemia on routine blood work. Laboratory tests confirm a total serum calcium of {calcium} mmol/L, a low serum phosphate, and a parathyroid hormone (PTH) level of {pth} pg/mL. What is the most likely diagnosis?",
        options: [
            { text: "Primary Hyperparathyroidism", isCorrect: true, explanation: "The combination of elevated total calcium ({calcium} mmol/L) and an inappropriately elevated PTH level ({pth} pg/mL) in the presence of hypophosphatemia is diagnostic of Primary Hyperparathyroidism, usually caused by a solitary parathyroid adenoma." },
            { text: "Hypercalcemia of Malignancy", isCorrect: false, explanation: "Malignancy causes hypercalcemia via PTH-related protein (PTHrP) or osteolytic metastases. Crucially, PTH secretion is physiologically suppressed (<10 pg/mL) by the high calcium in these cases, unlike this patient's elevated PTH of {pth} pg/mL." },
            { text: "Secondary Hyperparathyroidism", isCorrect: false, explanation: "Secondary hyperparathyroidism is a physiological response to hypocalcemia (often caused by Chronic Kidney Disease or severe Vitamin D deficiency). In this state, calcium is low or low-normal, not elevated." },
            { text: "Familial Hypocalciuric Hypercalcemia (FHH)", isCorrect: false, explanation: "While FHH presents with high calcium and mild PTH elevation, it is a benign autosomal dominant condition requiring a 24-hour urine calcium clearance to distinguish from primary hyperparathyroidism before performing any surgery." },
            { text: "Vitamin D Toxicity", isCorrect: false, explanation: "Excess vitamin D increases calcium absorption leading to hypercalcemia. However, high calcium levels suppress PTH secretion, whereas this patient has an elevated PTH of {pth} pg/mL." }
        ]
    },
    {
        id: 15,
        category: "Emergency & Toxicology",
        vars: {
            age: () => Math.floor(Math.random() * 10) + 18, // 18-28
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            hours: () => Math.floor(Math.random() * 3) + 5 // 5-7 hours
        },
        text: "A {age}-year-old {gender} is brought to the emergency department {hours} hours after ingesting an unknown quantity of acetaminophen (Tylenol) tablets in a suicide attempt. {subjCap} is asymptomatic. What is the most appropriate next step in management?",
        options: [
            { text: "Draw a serum acetaminophen level and check it against the Rumack-Matthew Nomogram", isCorrect: true, explanation: "For acetaminophen ingestion presenting between 4 and 24 hours, the first step is to draw a serum acetaminophen concentration at least 4 hours post-ingestion. This level is plotted on the Rumack-Matthew Nomogram to determine if N-acetylcysteine (NAC) therapy is indicated." },
            { text: "Administer activated charcoal immediately", isCorrect: false, explanation: "Activated charcoal is only effective at binding acetaminophen in the GI tract if administered within 1 to 2 hours of ingestion. At {hours} hours post-ingestion, its utility is minimal." },
            { text: "Immediate endotracheal intubation", isCorrect: false, explanation: "The patient is asymptomatic and does not have respiratory failure, anaphylaxis, or coma. Proactive intubation is not indicated." },
            { text: "Immediately administer N-acetylcysteine (NAC) without checking serum levels", isCorrect: false, explanation: "While NAC is highly effective, if the presentation is within 8 hours and serum levels can be obtained quickly, it is standard practice to check the nomogram first to avoid unnecessary treatment." },
            { text: "Discharge the patient with a psychiatry referral", isCorrect: false, explanation: "Discharging an acute toxic overdose patient before completing medical clearance is a severe clinical safety risk. Acetaminophen hepatotoxicity does not manifest clinically for 24-48 hours." }
        ]
    },
    {
        id: 16,
        category: "Geriatrics",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 68, // 68-82
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            bp: () => `${Math.floor(Math.random() * 15) + 130}/${Math.floor(Math.random() * 10) + 80}` // 130-145 / 80-90
        },
        text: "A {age}-year-old {gender} with a history of hypertension presents with intermittent palpitations, fatigue, and mild shortness of breath. Blood pressure is {bp} mmHg. An ECG reveals an irregularly irregular rhythm with no discernible P waves. What is the most important primary clinical step in this patient's long-term stroke risk management?",
        options: [
            { text: "Calculate the CHA2DS2-VASc (or CHADS2) score and initiate oral anticoagulation if indicated", isCorrect: true, explanation: "The ECG is diagnostic of Atrial Fibrillation. Because this patient is elderly ({age} years old) and hypertensive, they have a high risk of thromboembolic stroke. Stroke prevention with oral anticoagulants (DOACs like apixaban, or warfarin) based on scoring is the most critical intervention." },
            { text: "Immediate synchronized cardioversion", isCorrect: false, explanation: "Immediate cardioversion is only indicated if the patient is hemodynamically unstable (e.g., severe hypotension, pulmonary edema, active angina). Since the patient is stable (BP {bp}), rate control and stroke risk assessment are preferred." },
            { text: "Perform emergency coronary angiography", isCorrect: false, explanation: "Palpitations and AF do not indicate an acute coronary occlusion (MI) requiring emergent angiography unless active ischemic ECG changes (STEMI) are present." },
            { text: "Initiate daily low-dose aspirin 81 mg", isCorrect: false, explanation: "Aspirin (antiplatelet therapy) has been shown to be far less effective than oral anticoagulants at preventing ischemic strokes in atrial fibrillation and is no longer recommended as monotherapy for this purpose." },
            { text: "Perform a carotid endarterectomy", isCorrect: false, explanation: "Carotid endarterectomy is indicated for symptomatic carotid artery stenosis, not for atrial fibrillation, which is an embolic risk originating in the left atrium." }
        ]
    },
    {
        id: 17,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 3) + 3, // 3-5 weeks old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-week-old {gender} is brought to the clinic due to persistent, non-bilious projectile vomiting after every feeding. The child is hungry and eager to feed again immediately after vomiting. On physical examination, a small, firm, mobile mass is palpated in the right upper quadrant. What is the preferred diagnostic imaging modality?",
        options: [
            { text: "Abdominal Ultrasound", isCorrect: true, explanation: "The presentation is diagnostic of Infantile Hypertrophic Pyloric Stenosis (projectile non-bilious vomiting, 'hungry vomiter,' olive-shaped RUQ mass, presenting at {age} weeks of age). Pyloric ultrasound is the preferred diagnostic test showing a thickened and elongated pyloric channel." },
            { text: "Abdominal Computed Tomography (CT)", isCorrect: false, explanation: "Abdominal CT involves significant radiation exposure and is entirely unnecessary given the high accuracy and safety of ultrasound for pyloric stenosis." },
            { text: "Upper Gastrointestinal Contrast Series (Barium Swallow)", isCorrect: false, explanation: "A barium swallow can show a 'string sign' in pyloric stenosis, but it is reserved for cases where ultrasound is inconclusive, as it carries an aspiration risk." },
            { text: "Endoscopy (Esophagogastroduodenoscopy)", isCorrect: false, explanation: "Endoscopy is invasive, requires sedation, and is not the first-line diagnostic test for suspected pyloric stenosis." },
            { text: "Plain Abdominal X-ray (KUB)", isCorrect: false, explanation: "An X-ray might show a large, fluid-filled stomach with minimal distal gas, but it is not diagnostic or specific compared to ultrasound." }
        ]
    },
    {
        id: 18,
        category: "Obstetrics",
        vars: {
            age: () => Math.floor(Math.random() * 10) + 26, // 26-35
            weeks: () => Math.floor(Math.random() * 4) + 30 // 30-33 weeks
        },
        text: "A {age}-year-old pregnant woman, G2P1, at {weeks} weeks gestation presents with sudden-onset, painless, bright red vaginal bleeding. Her vitals are stable, and the fetal heart rate is reassuring. What is the most critical initial diagnostic step?",
        options: [
            { text: "Perform a transabdominal ultrasound to determine placental location", isCorrect: true, explanation: "Painless vaginal bleeding in the third trimester is classic for placenta previa. A transabdominal ultrasound is the critical first diagnostic step to check placental position. Digital vaginal examinations are strictly contraindicated until previa is ruled out, as they can cause massive, fatal hemorrhage." },
            { text: "Perform a digital sterile vaginal exam to check cervical dilation", isCorrect: false, explanation: "Digital exams are absolutely contraindicated in third-trimester bleeding until placenta previa is ruled out by ultrasound." },
            { text: "Administer intravenous oxytocin to augment labor", isCorrect: false, explanation: "Oxytocin increases uterine contractions, which is contraindicated and dangerous in active placenta previa as it can cause placental abruption and severe bleeding." },
            { text: "Perform an emergent Cesarean section", isCorrect: false, explanation: "An emergent C-section is only indicated for maternal hemodynamic instability or non-reassuring fetal status. Since both are stable, conservative management is preferred." },
            { text: "Perform an amniotomy (artificial rupture of membranes)", isCorrect: false, explanation: "Amniotomy is contraindicated in placenta previa as it can rupture placental vessels and lead to catastrophic maternal and fetal hemorrhage." }
        ]
    },
    {
        id: 19,
        category: "Rheumatology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 45, // 45-64
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with acute onset of severe pain, swelling, and redness in {possessive} first metatarsophalangeal (MTP) joint that woke {obj} up in the middle of the night. Arthrocentesis is performed. Polarized light microscopy of the synovial fluid is most likely to show which of the following findings?",
        options: [
            { text: "Needle-shaped, negatively birefringent crystals", isCorrect: true, explanation: "The presentation is classic for acute gouty arthritis (podagra). Synovial fluid analysis reveals needle-shaped monosodium urate crystals that exhibit negative birefringence under polarized light (appearing yellow when parallel to the slow compensator axis)." },
            { text: "Rhomboid-shaped, positively birefringent crystals", isCorrect: false, explanation: "Rhomboid-shaped, weakly positive birefringent crystals (calcium pyrophosphate) are characteristic of pseudogout, which classically affects the knee or wrist, not the first MTP joint." },
            { text: "Gram-negative intracellular diplococci", isCorrect: false, explanation: "This finding is diagnostic of Neisseria gonorrhoeae, which causes septic arthritis in sexually active young adults, presenting with migratory polyarthralgias." },
            { text: "Elevated rheumatoid factor and anti-CCP antibodies", isCorrect: false, explanation: "These are serum serological markers for Rheumatoid Arthritis, which typically presents as a chronic, symmetric, polyarticular inflammatory arthritis of the small joints of the hands." },
            { text: "Non-inflammatory fluid with low WBC count and high viscosity", isCorrect: false, explanation: "This fluid profile is classic for Osteoarthritis, a degenerative joint disease, not an acute inflammatory crystal-induced arthritis like gout." }
        ]
    },
    {
        id: 20,
        category: "Infectious Diseases",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 18, // 18-29
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            temp: () => (Math.random() * 1.0 + 39.0).toFixed(1) // 39.0 - 40.0 °C
        },
        text: "A {age}-year-old {gender} is brought to the emergency department by {possessive} roommate due to a temperature of {temp}°C, confusion, and photophobia. On physical exam, there is neck stiffness and positive Kernig's and Brudzinski's signs. What is the most appropriate empiric pharmacotherapy regimen after obtaining blood cultures?",
        options: [
            { text: "Intravenous Ceftriaxone, Vancomycin, and Dexamethasone", isCorrect: true, explanation: "The symptoms are highly diagnostic of acute bacterial meningitis. Immediate empiric therapy with Ceftriaxone (covers Neisseria and Strep pneumo), Vancomycin (covers resistant pneumococcus), and Dexamethasone (reduces neurological sequelae and hearing loss when given before/with antibiotics) is the gold standard." },
            { text: "Oral Amoxicillin and bed rest", isCorrect: false, explanation: "Bacterial meningitis is a critical medical emergency. Oral antibiotics are completely inappropriate as they do not achieve sufficient cerebrospinal fluid (CSF) concentrations." },
            { text: "Intravenous Acyclovir monotherapy", isCorrect: false, explanation: "Acyclovir is used to treat HSV encephalitis, which typically presents with focal temporal lobe deficits. This patient has classic signs of bacterial meningeal irritation (Kernig's/Brudzinski's) requiring bacterial coverage." },
            { text: "Intravenous Piperacillin-tazobactam", isCorrect: false, explanation: "Piperacillin-tazobactam does not have optimal CSF penetration for bacterial meningitis pathogens compared to third-generation cephalosporins like ceftriaxone." },
            { text: "Oral Ciprofloxacin and outpatient follow-up", isCorrect: false, explanation: "Meningitis has a high mortality rate and requires immediate ICU/ward admission for IV therapy. Outpatient care is highly contraindicated." }
        ]
    },
    {
        id: 21,
        category: "Gastroenterology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 25, // 25-44
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            weight: () => Math.floor(Math.random() * 5) + 4 // 4-8 kg
        },
        text: "A {age}-year-old {gender} presents with a 6-month history of chronic watery diarrhea, abdominal bloating, flatulence, and unintentional weight loss of {weight} kg. Laboratory work shows microcytic anemia. What is the most appropriate initial serological screening test for this patient's condition?",
        options: [
            { text: "IgA tissue Transglutaminase (tTG) antibody", isCorrect: true, explanation: "The symptoms of chronic malabsorptive diarrhea, bloating, weight loss, and iron-deficiency anemia in a young adult are highly suggestive of Celiac Disease. The initial screening test of choice is the IgA tissue transglutaminase (tTG) antibody, along with a total IgA level to rule out selective IgA deficiency." },
            { text: "Duodenal biopsy showing villous atrophy", isCorrect: false, explanation: "While a duodenal biopsy showing intraepithelial lymphocytosis and villous atrophy is the gold-standard confirmatory test for Celiac Disease, it is invasive and not the initial screening test of choice." },
            { text: "Serum Anti-Saccharomyces cerevisiae antibodies (ASCA)", isCorrect: false, explanation: "ASCA is a marker associated with Crohn's disease, not Celiac disease." },
            { text: "Stool cultures and ova & parasite (O&P) exam", isCorrect: false, explanation: "While stool tests rule out infectious causes of chronic diarrhea, they do not screen for Celiac disease, which is an autoimmune enteropathy." },
            { text: "Hydrogen breath test", isCorrect: false, explanation: "The hydrogen breath test is used to diagnose lactose intolerance or Small Intestinal Bacterial Overgrowth (SIBO), not Celiac disease." }
        ]
    },
    {
        id: 22,
        category: "Nephrology & Urology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 30, // 30-49
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            side: () => Math.random() > 0.5 ? 'right' : 'left'
        },
        text: "A {age}-year-old {gender} presents with sudden-onset, excruciating, colicky {side} flank pain that radiates to {possessive} groin. {subjCap} is pacing around the exam room, unable to find a comfortable position, and is experiencing nausea. What is the diagnostic imaging study of choice?",
        options: [
            { text: "Non-contrast Computed Tomography (CT) of the abdomen and pelvis", isCorrect: true, explanation: "The presentation is classic for acute renal colic (kidney stone). The gold-standard diagnostic imaging study of choice is a low-dose, non-contrast helical CT scan of the abdomen and pelvis, which has nearly 100% sensitivity for detecting urinary tract calculi." },
            { text: "Renal Ultrasound", isCorrect: false, explanation: "Renal ultrasound is safe and can show hydronephrosis, but it is less sensitive at identifying small ureteral stones (<5 mm) and is typically reserved for pregnant patients or children to avoid radiation." },
            { text: "Contrast-enhanced Abdominal CT", isCorrect: false, explanation: "Intravenous contrast is not indicated for renal stones, as the hyperdense contrast material in the collecting system can completely mask the stone." },
            { text: "Magnetic Resonance Imaging (MRI)", isCorrect: false, explanation: "MRI is expensive, time-consuming, and less sensitive than non-contrast CT for detecting calcified urinary stones." },
            { text: "Retrograde Pyelogram", isCorrect: false, explanation: "A retrograde pyelogram is an invasive fluoroscopic surgical procedure used to guide ureteral stenting, not a first-line diagnostic imaging test." }
        ]
    },
    {
        id: 23,
        category: "Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 25, // 25-44
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents to the clinic 3 months after {possessive} spouse passed away in a motor vehicle accident. {subjCap} reports severe feelings of sadness, an inability to concentrate, insomnia, and a 5 kg weight loss. Crucially, {subj} expresses profound guilt about being alive when {possessive} spouse died, experiences passive suicidal ideation, and displays marked psychomotor retardation. What is the most appropriate diagnosis?",
        options: [
            { text: "Major Depressive Disorder", isCorrect: true, explanation: "While grief (bereavement) is a normal response to loss, the presence of severe depressive symptoms—specifically active/passive suicidal ideation, psychomotor retardation, profound guilt unrelated to the deceased, and functional impairment—meets the diagnostic criteria for Major Depressive Disorder (MDD). Treatment with psychotherapy and/or SSRIs is indicated." },
            { text: "Normal Grief (Uncomplicated Bereavement)", isCorrect: false, explanation: "Normal grief typically involves feelings of sadness and emptiness that come in waves ('pangs of grief') and are focused primarily on the deceased. It does not typically feature severe psychomotor retardation, profound self-loathing, or active suicidal ideation." },
            { text: "Adjustment Disorder with Depressed Mood", isCorrect: false, explanation: "Adjustment disorder can only be diagnosed if the symptoms do not meet the criteria for another specific mental disorder (like MDD) and occur within 3 months of a stressor." },
            { text: "Persistent Depressive Disorder (Dysthymia)", isCorrect: false, explanation: "Dysthymia requires a chronic depressed mood present for at least 2 years in adults, which does not fit this acute 3-month presentation." },
            { text: "Post-Traumatic Stress Disorder (PTSD)", isCorrect: false, explanation: "While the death was sudden, PTSD requires specific symptom clusters (intrusion, avoidance, negative alterations in cognitions/mood, and hyperarousal) present for >1 month, which are not described here." }
        ]
    },
    {
        id: 24,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 6, // 6-17 months old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-month-old {gender} is brought to the emergency department with a 12-hour history of intermittent, severe abdominal pain. During these episodes, the child screams and draws {possessive} knees up to {possessive} chest, but appears completely normal between episodes. {subjCap} has vomited twice and passed a stool resembling red currant jelly. What is the preferred diagnostic and therapeutic intervention?",
        options: [
            { text: "Air (or Contrast) Enema", isCorrect: true, explanation: "The presentation is classic for Intussusception (intermittent severe colicky pain, knee-chest drawing, currant jelly stools, typically in infants 6-36 months). An air-contrast or hydrostatic enema is both the preferred diagnostic modality and the primary non-surgical therapeutic intervention (successfully reducing the intussusception in >85% of cases)." },
            { text: "Emergent exploratory laparotomy", isCorrect: false, explanation: "Surgery is reserved for cases with signs of peritonitis, intestinal perforation, hemodynamic shock, or when non-surgical enema reduction fails." },
            { text: "Abdominal Computed Tomography (CT) with oral contrast", isCorrect: false, explanation: "Abdominal CT is not indicated. Intussusception is easily and safely evaluated using ultrasound (showing a 'target' or 'donut' sign) and managed with an enema." },
            { text: "Oral administration of polyethylene glycol (Laxative)", isCorrect: false, explanation: "Intussusception is a mechanical bowel obstruction (one segment invaginating into another). Laxatives are completely contraindicated and highly dangerous." },
            { text: "Reassurance and symptomatic discharge", isCorrect: false, explanation: "Untreated intussusception can lead to bowel ischemia, perforation, peritonitis, and death. Urgent intervention is mandatory." }
        ]
    },
    {
        id: 25,
        category: "Cardiology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 55, // 55-74
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 2-month history of substernal chest pressure that radiates to {possessive} left shoulder. The pain consistently occurs when walking up two flights of stairs or carrying heavy groceries and is completely relieved within 5 minutes of resting or taking sublingual nitroglycerin. {subjCap} has a history of hypertension and dyslipidemia. What is the most appropriate initial diagnostic investigation?",
        options: [
            { text: "Exercise ECG Stress Testing", isCorrect: true, explanation: "The clinical history is diagnostic of stable angina (predictable chest pain on exertion, relieved by rest/nitroglycerin). In patients with a normal baseline ECG who are able to exercise, an exercise tolerance test (Stress ECG) is the standard initial diagnostic test to assess for ischemia." },
            { text: "Emergent coronary angiography", isCorrect: false, explanation: "Emergent angiography is reserved for acute coronary syndromes (instable angina, NSTEMI, STEMI) or high-risk stable patients. This patient is clinically stable." },
            { text: "24-hour ambulatory Holter monitoring", isCorrect: false, explanation: "Holter monitoring is used to evaluate cardiac arrhythmias (palpitations, syncope), not to diagnose exertional coronary artery disease." },
            { text: "Echocardiogram at rest", isCorrect: false, explanation: "While a resting echocardiogram evaluates cardiac structure and EF, it cannot assess for inducible exertional ischemia caused by stable coronary plaques." },
            { text: "CT coronary calcium scoring", isCorrect: false, explanation: "Calcium scoring is a screening tool for cardiovascular risk in asymptomatic individuals, not a diagnostic test for symptomatic patients with classic angina." }
        ]
    },
    {
        id: 26,
        category: "Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 35, // 35-54
            gender: () => Math.random() > 0.5 ? 'female' : 'male',
            temp: () => (Math.random() * 0.8 + 38.1).toFixed(1) // 38.1 - 38.8 °C
        },
        text: "A {age}-year-old {gender} presents with constant, severe right upper quadrant (RUQ) abdominal pain radiating to the right scapula, which began 6 hours after eating a cheeseburger. On physical exam, the patient has a temperature of {temp}°C and ceases inspiration abruptly upon deep palpation of the RUQ (Murphy's sign). What is the most likely diagnosis?",
        options: [
            { text: "Acute Cholecystitis", isCorrect: true, explanation: "Constant RUQ pain (often postprandial), fever ({temp}°C), and a positive Murphy's sign are diagnostic of Acute Cholecystitis, an inflammatory obstruction of the cystic duct. Ultrasound is the initial imaging of choice (showing wall thickening, gallstones, and sonographic Murphy's)." },
            { text: "Biliary Colic", isCorrect: false, explanation: "Biliary colic presents with transient epigastric/RUQ pain that resolves within 4 to 6 hours and does *not* present with inflammatory markers like fever ({temp}°C), constant localized tenderness, or leukocytosis." },
            { text: "Acute Ascending Cholangitis", isCorrect: false, explanation: "Cholangitis features Charcot's Triad (fever, RUQ pain, and systemic jaundice) or Reynolds' Pentad (adding hypotension and confusion) due to complete biliary tree obstruction and infection." },
            { text: "Perforated Peptic Ulcer", isCorrect: false, explanation: "A perforated ulcer typically presents with sudden-onset, diffuse, severe abdominal pain and signs of generalized peritonitis (rigidity, guarding) and free air under the diaphragm." },
            { text: "Gastroesophageal Reflux Disease (GERD)", isCorrect: false, explanation: "GERD causes burning substernal chest pain (heartburn) worsened by lying flat, not constant localized RUQ peritonitic pain, fever, and a positive Murphy's sign." }
        ]
    },
    {
        id: 27,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 10) + 18 // 18-27
        },
        text: "A {age}-year-old woman presents to the gynecology clinic with a history of highly irregular menstrual periods (oligomenorrhea) since menarche, severe acne, and excess dark hair growth on her face and abdomen. She has a Body Mass Index (BMI) of 31 kg/m². What chronic long-term risk is this patient at most risk of developing if her condition remains untreated?",
        options: [
            { text: "Endometrial Hyperplasia and Carcinoma", isCorrect: true, explanation: "The patient presents with Polycystic Ovary Syndrome (PCOS) characterized by oligomenorrhea, hyperandrogenism, and obesity. Chronic anovulation leads to unopposed estrogen stimulation of the endometrium (due to a lack of progesterone), significantly increasing the long-term risk of endometrial hyperplasia and adenocarcinoma." },
            { text: "Ovarian Cancer", isCorrect: false, explanation: "PCOS is not associated with an increased risk of ovarian cancer. In fact, combined oral contraceptive pills (frequently used to treat PCOS) are highly protective against ovarian cancer." },
            { text: "Cervical Dysplasia", isCorrect: false, explanation: "Cervical dysplasia and cancer are caused by persistent infection with high-risk strains of Human Papillomavirus (HPV), not by endocrine or ovulatory dysfunction." },
            { text: "Primary Ovarian Insufficiency (POI)", isCorrect: false, explanation: "POI features premature depletion of ovarian follicles leading to hypergonadotropic hypogonadism (elevated FSH/LH, low estrogen) and early menopause, which is the opposite of PCOS." },
            { text: "Fibroadenomas of the breast", isCorrect: false, explanation: "Breast fibroadenomas are benign, estrogen-sensitive breast tumors in young women and are not clinically associated with PCOS or chronic anovulation." }
        ]
    },
    {
        id: 28,
        category: "Infectious Diseases",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 20, // 20-39
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 5-day history of low-grade fever, fatigue, joint aches, and a circular, expanding skin rash with central clearing on {possessive} left thigh. {subjCap} recalls returning from a camping and hiking trip in a wooded region of Ontario 10 days ago. What is the most appropriate management strategy?",
        options: [
            { text: "Prescribe oral Doxycycline 100 mg twice daily for 10-14 days immediately", isCorrect: true, explanation: "The clinical presentation is diagnostic of early localized Lyme Disease (Erythema Migrans, 'bullseye rash', hiking history in endemic area). Erythema migrans is diagnostic on its own. Serological testing (ELISA/Western Blot) is highly insensitive in the first few weeks, so empirical treatment with Doxycycline should be started immediately without waiting for lab confirmation." },
            { text: "Order Borrelia burgdorferi serology (ELISA) and wait for results before treating", isCorrect: false, explanation: "Lyme serologies are frequently negative in early localized disease. Delaying treatment while waiting for lab results is incorrect and risks disease progression to secondary stages." },
            { text: "Obtain a punch biopsy of the rash edge for histopathology", isCorrect: false, explanation: "Skin biopsy is invasive, non-specific for Lyme disease, and entirely unnecessary given the diagnostic pathognomonic appearance of Erythema Migrans." },
            { text: "Initiate high-dose intravenous Ceftriaxone", isCorrect: false, explanation: "IV Ceftriaxone is reserved for late or severe manifestations of Lyme disease (such as meningitis, high-degree AV block, or severe carditis), not for uncomplicated early localized disease." },
            { text: "Apply topical hydrocortisone 1% cream and follow up in 1 week", isCorrect: false, explanation: "Steroid creams do not treat the underlying bacterial infection (Borrelia burgdorferi) and will allow the infection to disseminate throughout the body." }
        ]
    },
    {
        id: 29,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 3) + 1, // 1-3 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-year-old {gender} is brought to the emergency department in the middle of the night with a harsh, 'barking' cough and mild hoarseness. On physical examination, the child is alert but has audible inspiratory stridor when agitated, with mild subcostal retractions. What is the most appropriate first-line pharmacotherapy?",
        options: [
            { text: "A single dose of oral (or intramuscular) Dexamethasone", isCorrect: true, explanation: "The presentation is classic for Croup (laryngotracheobronchitis, caused by parainfluenza virus), presenting with a barking cough and stridor. A single dose of Dexamethasone (0.6 mg/kg) is the standard first-line treatment for mild to moderate croup to reduce laryngeal mucosal edema." },
            { text: "Administer nebulized Budesonide combined with oral Amoxicillin", isCorrect: false, explanation: "Croup is a viral infection (Parainfluenza virus), so antibacterial agents like Amoxicillin are completely ineffective and inappropriate." },
            { text: "Initiate daily maintenance inhaled Fluticasone via spacer", isCorrect: false, explanation: "Maintenance inhaled corticosteroids are used for chronic asthma control, not for acute, short-term management of viral croup." },
            { text: "Immediate endotracheal intubation and mechanical ventilation", isCorrect: false, explanation: "Intubation is only indicated for severe croup with respiratory failure (exhaustion, cyanosis, altered consciousness), which is extremely rare." },
            { text: "Prescribe oral Albuterol (Salbutamol) syrup and home humidification", isCorrect: false, explanation: "Bronchodilators like salbutamol act on the lower airways and are ineffective in croup, which is an upper airway (laryngeal) obstructive condition." }
        ]
    },
    {
        id: 30,
        category: "Endocrinology",
        vars: {
            age: () => Math.floor(Math.random() * 25) + 30, // 30-54
            gender: () => Math.random() > 0.5 ? 'female' : 'male',
            tsh: () => (Math.random() * 15 + 12).toFixed(1) // 12.0 - 27.0 mIU/L (Normal 0.4 - 4.0)
        },
        text: "A {age}-year-old {gender} presents with a 6-month history of progressive fatigue, generalized weakness, unexplained weight gain of 4 kg, severe constipation, and cold intolerance. On exam, the skin is dry and cool, and there is a mild, diffuse, non-tender enlargement of the thyroid gland. Laboratory evaluation reveals a serum TSH of {tsh} mIU/L and a low free T4. What is the most likely diagnosis?",
        options: [
            { text: "Primary Hypothyroidism (Hashimoto's Thyroiditis)", isCorrect: true, explanation: "Fatigue, weight gain, cold intolerance, dry skin, and goiter associated with elevated TSH ({tsh} mIU/L) and low free T4 are diagnostic of Primary Hypothyroidism, most commonly caused by Hashimoto's (autoimmune thyroiditis). Levothyroxine is the treatment of choice." },
            { text: "Secondary (Central) Hypothyroidism", isCorrect: false, explanation: "Central hypothyroidism is caused by pituitary or hypothalamic failure. In this state, TSH would be low or inappropriately normal in the setting of low free T4, not elevated to {tsh} mIU/L." },
            { text: "Subclinical Hypothyroidism", isCorrect: false, explanation: "Subclinical hypothyroidism is characterized by an elevated TSH with a *normal* free T4 level. Since this patient's free T4 is low, they have overt primary hypothyroidism." },
            { text: "Grave's Disease", isCorrect: false, explanation: "Grave's disease causes hyperthyroidism, presenting with weight loss, heat intolerance, anxiety, tremors, diarrhea, and a suppressed TSH (<0.1 mIU/L)." },
            { text: "De Quervain's (Subacute Granulomatous) Thyroiditis", isCorrect: false, explanation: "Subacute thyroiditis presents with a highly painful, tender thyroid gland following a viral respiratory illness, typically transitioning through a transient hyperthyroid phase." }
        ]
    },
    {
        id: 31,
        category: "Emergency & Pulmonology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 20, // 20-34
            gender: () => Math.random() > 0.5 ? 'female' : 'male',
            hr: () => Math.floor(Math.random() * 15) + 105, // 105-119 bpm
            rr: () => Math.floor(Math.random() * 5) + 24 // 24-28 breaths/min
        },
        text: "A {age}-year-old {gender} presents to the emergency department with sudden-onset shortness of breath and sharp, right-sided pleuritic chest pain that began 4 hours ago. On physical exam, the heart rate is {hr} bpm, respiratory rate is {rr} breaths/min, and oxygen saturation is 91% on room air. Lungs are clear to auscultation bilaterally, and chest X-ray is normal. What is the gold-standard diagnostic imaging study of choice?",
        options: [
            { text: "Computed Tomography Pulmonary Angiography (CTPA)", isCorrect: true, explanation: "The presentation is classic for a Pulmonary Embolism (sudden-onset dyspnea, pleuritic chest pain, sinus tachycardia, tachypnea, hypoxia, normal chest X-ray). CTPA is the gold-standard diagnostic imaging study of choice to confirm pulmonary embolism." },
            { text: "Ventilation-Perfusion (V/Q) Lung Scan", isCorrect: false, explanation: "A V/Q scan is highly useful but is typically reserved as a second-line diagnostic alternative for patients with contraindications to CTPA (such as severe renal impairment or iodinated contrast allergy)." },
            { text: "Transthoracic Echocardiogram (TTE)", isCorrect: false, explanation: "TTE can show signs of right ventricular strain (McConnell's sign) in massive PE, but it is not sensitive or specific enough to rule out or definitively diagnose a PE." },
            { text: "Duplex Venous Ultrasound of the lower extremities", isCorrect: false, explanation: "While a lower extremity DVT is the source of most PEs, a negative leg ultrasound does not rule out a pulmonary embolism, as the entire thrombus may have already embolized." },
            { text: "High-resolution Chest CT (HRCT)", isCorrect: false, explanation: "HRCT is used to evaluate interstitial lung diseases (pulmonary fibrosis, bronchiectasis) and does not utilize the vascular-phase contrast necessary to visualize pulmonary artery emboli." }
        ]
    },
    {
        id: 32,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 24 // 24-35
        },
        text: "A {age}-year-old woman, G1P1, has just delivered a healthy infant at 39 weeks gestation via uncomplicated vaginal delivery. Ten minutes later, the placenta is delivered intact. Shortly after, she begins to experience heavy, continuous vaginal bleeding. On physical examination, her uterus is noted to be soft, enlarged, and boggy, palpated above the umbilicus. What is the most likely cause and the immediate first-line management?",
        options: [
            { text: "Uterine Atony; Bimanual uterine massage and intravenous Oxytocin infusion", isCorrect: true, explanation: "Uterine Atony (failure of the uterus to contract effectively after delivery) is the cause of >80% of Postpartum Hemorrhage (PPH) cases, characterized by a soft, boggy uterus. First-line management is immediate bimanual uterine massage and administration of uterotonic agents (such as IV oxytocin infusion)." },
            { text: "Retained Placental Fragments; Emergent dilation and curettage (D&C)", isCorrect: false, explanation: "While retained products can cause PPH, the placenta was delivered intact and the primary exam finding is a boggy uterus, which indicates uterine atony. Massage/oxytocin are always the initial steps." },
            { text: "Uterine Inversion; Immediate manual replacement of the uterus", isCorrect: false, explanation: "Uterine inversion presents with a visible bluish-gray mass protruding from the vagina and the complete absence of a palpable uterine fundus in the abdomen." },
            { text: "Cervical Laceration; Surgical exploration and repair under anesthesia", isCorrect: false, explanation: "Lacerations typically present with continuous bleeding despite a firm, contracted, well-toned uterus on physical examination." },
            { text: "Coagulopathy (DIC); Transfusion of fresh frozen plasma (FFP) and platelets", isCorrect: false, explanation: "DIC is a secondary cause of severe hemorrhage (often following abruption or amniotic fluid embolism) but is not the primary cause of post-delivery boggy uterus." }
        ]
    },
    {
        id: 33,
        category: "Neurology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 22, // 22-36
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} presents with a 3-day history of painful, progressive loss of vision in {possessive} left eye. {subjCap} also reports a sharp, electric shock-like sensation radiating down {possessive} spine when flexing {possessive} neck forward. Physical exam reveals an afferent pupillary defect in the left eye. What is the preferred acute first-line medical therapy?",
        options: [
            { text: "Intravenous Methylprednisolone (High-dose)", isCorrect: true, explanation: "The presentation is classic for Multiple Sclerosis presenting with acute optic neuritis (painful unilateral vision loss, pupillary defect) and Lhermitte's sign (shock-like sensation on neck flexion). Acute relapses are treated with high-dose intravenous methylprednisolone (1g daily for 3-5 days) to speed recovery." },
            { text: "Interferon beta-1a subcutaneous injections", isCorrect: false, explanation: "Interferon beta is a disease-modifying therapy (DMT) used for long-term prevention of relapses in relapsing-remitting MS, not for acute treatment of active exacerbations." },
            { text: "Oral Prednisone (Low-dose)", isCorrect: false, explanation: "Low-dose oral prednisone is avoided in acute optic neuritis, as clinical trials (ONTT) showed it actually increases the rate of recurrent optic neuritis episodes." },
            { text: "Intravenous Immunoglobulin (IVIG)", isCorrect: false, explanation: "IVIG is used in other neuromuscular conditions (Guillain-Barré, Myasthenia Gravis crisis) but is not first-line for acute Multiple Sclerosis flare-ups." },
            { text: "Oral Acetazolamide", isCorrect: false, explanation: "Acetazolamide is used to lower intracranial pressure in Idiopathic Intracranial Hypertension (Pseudotumor Cerebri), not to treat demyelinating optic neuritis." }
        ]
    },
    {
        id: 34,
        category: "Gastroenterology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 35, // 35-54
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents to the emergency department with sudden-onset, boring, severe epigastric abdominal pain that radiates straight through to {possessive} back. The pain is partially relieved when sitting up and leaning forward. The patient has vomited three times. Lipase level is elevated at 5 times the upper limit of normal. What is the most critical initial therapeutic intervention?",
        options: [
            { text: "Aggressive intravenous fluid resuscitation (isotonic crystalloids)", isCorrect: true, explanation: "The presentation is diagnostic of Acute Pancreatitis (classic epigastric pain radiating to back, elevated lipase >3x normal). The most critical initial intervention is aggressive intravenous fluid resuscitation (preferably Ringer's Lactate or Normal Saline) to maintain pancreatic perfusion and prevent pancreatic necrosis." },
            { text: "Immediate surgical debridement of the pancreas", isCorrect: false, explanation: "Surgery is contraindicated in early acute pancreatitis and is only indicated weeks later for specific complications, such as infected pancreatic necrosis or symptomatic pseudocysts." },
            { text: "Administration of broad-spectrum prophylactic intravenous antibiotics", isCorrect: false, explanation: "Prophylactic antibiotics are strictly *not* recommended in uncomplicated acute pancreatitis, as it is a sterile inflammatory process. Antibiotics are reserved for documented infections (cholangitis, bacteremia, or gas on CT)." },
            { text: "Perform an urgent endoscopic retrograde cholangiopancreatography (ERCP)", isCorrect: false, explanation: "ERCP is only indicated for acute biliary pancreatitis *if* there is concurrent acute ascending cholangitis or persistent, severe common bile duct obstruction." },
            { text: "Initiate high-flow enteral nutrition via nasojejunal tube within 6 hours", isCorrect: false, explanation: "While early nutrition is encouraged once pain subsides, immediate aggressive IV fluid resuscitation is the most critical and time-sensitive intervention to prevent organ failure." }
        ]
    },
    {
        id: 35,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 3) + 1, // 1-3 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl',
            temp: () => (Math.random() * 1.0 + 38.8).toFixed(1) // 38.8 - 39.8 °C
        },
        text: "A {age}-year-old {gender} is brought to the clinic by worried parents after experiencing a single, generalized tonic-clonic seizure lasting 3 minutes. The seizure occurred during a rapid rise in body temperature to {temp}°C due to a viral upper respiratory infection. The child is now fully alert and back to baseline. Neurological examination is entirely normal. What is the most appropriate management?",
        options: [
            { text: "Reassurance of the parents and conservative outpatient care", isCorrect: true, explanation: "The child experienced a Simple Febrile Seizure (generalized, <15 minutes, single episode in 24 hours, returning quickly to baseline, occurring in a child aged 6 months to 5 years). The prognosis is excellent, and management consists of parental reassurance, antipyretics (acetaminophen/ibuprofen) for comfort, and search for the fever source." },
            { text: "Initiate daily maintenance therapy with Phenobarbital or Valproic Acid", isCorrect: false, explanation: "Prophylactic antiepileptic drugs are not indicated for simple febrile seizures because their side effects far outweigh any benefits, and they do not prevent the development of epilepsy." },
            { text: "Perform an immediate lumbar puncture to examine CSF", isCorrect: false, explanation: "Lumbar puncture is only indicated if there are signs of meningitis (neck stiffness, bulging fontanelle, altered mental status) or if the child is inadequately immunized, which is not the case here." },
            { text: "Schedule an urgent outpatient brain MRI", isCorrect: false, explanation: "Neuroimaging (CT/MRI) is not indicated in simple febrile seizures as it does not change management or reveal structural pathology." },
            { text: "Admit the patient for 24-hour continuous video EEG monitoring", isCorrect: false, explanation: "Routine EEG is not recommended for a simple febrile seizure, as it does not predict future seizure recurrence or the development of epilepsy." }
        ]
    },
    {
        id: 36,
        category: "Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 8) + 18, // 18-25
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is brought to the psychiatry clinic by family members due to an 8-month history of progressive social withdrawal, poor personal hygiene, and highly bizarre behavior. During the interview, the patient states that {subj} hears voices commenting on {possessive} actions and firmly believes that a government agency has implanted a microchip in {possessive} brain to monitor {possessive} thoughts. What is the most likely diagnosis?",
        options: [
            { text: "Schizophrenia", isCorrect: true, explanation: "The clinical presentation is diagnostic of Schizophrenia. The diagnosis requires at least two characteristic symptoms (delusions, hallucinations, disorganized speech, disorganized behavior, or negative symptoms) present for a significant portion of time during a period of at least 6 months, resulting in social/occupational dysfunction." },
            { text: "Schizophreniform Disorder", isCorrect: false, explanation: "Schizophreniform disorder has identical clinical criteria to schizophrenia, but its duration must be strictly *less than 6 months* (between 1 and 6 months). Since this patient's symptoms have lasted 8 months, schizophrenia is diagnosed." },
            { text: "Brief Psychotic Disorder", isCorrect: false, explanation: "Brief psychotic disorder is diagnosed when psychotic symptoms last *less than 1 month*, followed by a full return to premorbid baseline functioning." },
            { text: "Delusional Disorder", isCorrect: false, explanation: "Delusional disorder features non-bizarre delusions *without* other active symptoms of schizophrenia (such as the auditory hallucinations or prominent functional/hygiene deterioration seen here)." },
            { text: "Schizoid Personality Disorder", isCorrect: false, explanation: "Schizoid personality disorder is characterized by a lifelong pattern of social detachment and restricted affect, but it does *not* feature active positive psychotic symptoms like hallucinations or delusions." }
        ]
    },
    {
        id: 37,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 6) + 6, // 6-11 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl',
            rr: () => Math.floor(Math.random() * 6) + 28 // 28-33 breaths/min
        },
        text: "A {age}-year-old {gender} with a history of mild intermittent asthma presents to the emergency department with acute shortness of breath and wheezing after a mild cold. On exam, respiratory rate is {rr} breaths/min, oxygen saturation is 93% on room air, and diffuse expiratory wheezing is heard bilaterally with mild intercostal retractions. What is the most appropriate initial therapy?",
        options: [
            { text: "Inhaled Short-Acting Beta-Agonist (SABA) and systemic corticosteroids", isCorrect: true, explanation: "The child is presenting with an acute asthma exacerbation (tachypnea, wheezing, retractions). The standard initial therapy is inhaled short-acting beta-agonists (SABA like salbutamol) via spacer or nebulizer, combined with early administration of systemic corticosteroids (oral dexamethasone or prednisolone) to reduce airway inflammation." },
            { text: "Inhaled Long-Acting Beta-Agonist (LABA) monotherapy", isCorrect: false, explanation: "LABAs (such as salmeterol) have a slow onset of action and should *never* be used as monotherapy or in acute rescue settings due to an increased risk of severe asthma-related death." },
            { text: "Intravenous antibiotics and chest physiotherapy", isCorrect: false, explanation: "Asthma exacerbations are typically triggered by viral infections, not bacterial pathogens. Prophylactic antibiotics are entirely inappropriate." },
            { text: "Inhaled Ipratropium Bromide monotherapy", isCorrect: false, explanation: "While anticholinergics (ipratropium) are added to SABAs in moderate-to-severe exacerbations (DuoNeb), they are never used as standalone monotherapy for rescue." },
            { text: "Intravenous Magnesium Sulfate infusion", isCorrect: false, explanation: "IV magnesium sulfate is reserved as an adjunctive therapy for severe, life-threatening asthma exacerbations that fail to respond to repeated first-line SABA/steroid treatments." }
        ]
    },
    {
        id: 38,
        category: "Endocrinology",
        vars: {
            age: () => Math.floor(Math.random() * 6) + 12, // 12-17
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is brought to the clinic due to a 3-week history of polyuria, polydipsia, and an unintentional weight loss of 5 kg despite a voracious appetite. Today, {subj} is lethargic, reports abdominal pain, and has deep, rapid respirations (Kussmaul breathing). Fingerstick glucose reads 24.5 mmol/L. What is the most critical immediate therapeutic priority?",
        options: [
            { text: "Intravenous fluid resuscitation with isotonic saline (0.9% NaCl)", isCorrect: true, explanation: "The patient is presenting in Diabetic Ketoacidosis (DKA), a life-threatening complication of Type 1 Diabetes. The single most critical initial step in DKA management is aggressive intravenous fluid resuscitation with isotonic saline to restore intravascular volume, improve renal perfusion, and clear ketones." },
            { text: "Immediate intravenous bolus of high-dose insulin", isCorrect: false, explanation: "While insulin is necessary to close the anion gap, it should *never* be given before starting fluid resuscitation. Giving insulin first can cause rapid fluid shifts into cells, worsening intravascular collapse and cardiovascular shock." },
            { text: "Intravenous administration of sodium bicarbonate", isCorrect: false, explanation: "Sodium bicarbonate is not recommended in DKA unless the arterial pH is extremely low (<6.9), as it can cause paradoxical CSF acidosis, hypokalemia, and delay recovery." },
            { text: "Initiate daily subcutaneous basal-bolus insulin regimen", isCorrect: false, explanation: "An acute emergency like DKA must be managed with continuous intravenous insulin infusion, not long-term subcutaneous regimens, which have slow onset." },
            { text: "Oral administration of metformin", isCorrect: false, explanation: "Metformin is a type 2 diabetes medication that takes days/weeks to act and plays no role in the management of DKA, which is caused by profound absolute insulin deficiency." }
        ]
    },
    {
        id: 39,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 8) + 2, // 2-9 months old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl',
            rr: () => Math.floor(Math.random() * 15) + 45 // 45-59 breaths/min
        },
        text: "A {age}-month-old {gender} presents with a 3-day history of clear nasal discharge, a mild cough, and progressive wheezing. On physical exam, the child has a respiratory rate of {rr} breaths/min, oxygen saturation of 94% on room air, and diffuse expiratory wheezing with mild subcostal retractions. Nasal swab is positive for Respiratory Syncytial Virus (RSV). What is the most appropriate management strategy?",
        options: [
            { text: "Supportive care with adequate hydration and nasal suctioning", isCorrect: true, explanation: "The presentation is classic for acute viral Bronchiolitis (most commonly RSV in infants <2 years). Management is strictly supportive, consisting of maintaining adequate hydration and clearing nasal secretions with bulb suctioning. Bronchodilators, steroids, and antibiotics are not recommended." },
            { text: "Prescribe oral Amoxicillin for 7 days", isCorrect: false, explanation: "Bronchiolitis is a viral illness. Antibiotics are not indicated unless there is a documented secondary bacterial infection (such as acute otitis media)." },
            { text: "Administer nebulized Salbutamol (Albuterol) every 4 hours", isCorrect: false, explanation: "Clinical trials have consistently shown that bronchodilators like salbutamol do not improve outcomes, reduce hospital admission rates, or shorten the course of bronchiolitis." },
            { text: "Prescribe a 5-day course of oral Prednisolone", isCorrect: false, explanation: "Systemic corticosteroids (oral or IV) do not provide any clinical benefit in acute bronchiolitis and are not recommended." },
            { text: "Administer prophylactic ribavirin aerosol therapy", isCorrect: false, explanation: "Ribavirin is an expensive antiviral drug with significant toxicity and is reserved exclusively for severe bronchiolitis in highly immunocompromised infants." }
        ]
    },
    {
        id: 40,
        category: "Cardiology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 65, // 65-84
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            bp: () => `${Math.floor(Math.random() * 20) + 140}/${Math.floor(Math.random() * 10) + 80}` // 140-159 / 80-89
        },
        text: "A {age}-year-old {gender} with a history of ischemic cardiomyopathy presents to the emergency department with severe, progressive shortness of breath, orthopnea, and paroxysmal nocturnal dyspnea. Blood pressure is {bp} mmHg. On physical exam, there is bilateral pitting ankle edema, an elevated jugular venous pressure (JVP), and diffuse crackles in both lung bases. An S3 gallop is heard on cardiac auscultation. What is the first-line medication of choice?",
        options: [
            { text: "Intravenous Loop Diuretic (Furosemide)", isCorrect: true, explanation: "The patient is presenting with an acute exacerbation of Congestive Heart Failure (Acute Decompensated Heart Failure) with volume overload. The first-line therapy of choice is an intravenous loop diuretic (such as Furosemide) to reduce venous congestion, clear pulmonary edema, and improve respiration." },
            { text: "Intravenous Beta-Blocker (Metoprolol)", isCorrect: false, explanation: "While beta-blockers are vital for long-term survival in chronic stable heart failure, they should *never* be initiated or increased in acute decompensated heart failure as they can further depress myocardial contractility." },
            { text: "Oral Spironolactone", isCorrect: false, explanation: "Spironolactone is an aldosterone antagonist used for long-term mortality benefits in chronic class II-IV heart failure, not for rapid, acute diuresis." },
            { text: "Intravenous Dobutamine infusion", isCorrect: false, explanation: "Inotropic agents like dobutamine are reserved exclusively for patients in cardiogenic shock (hypotension, poor perfusion). This patient is stable with elevated BP ({bp} mmHg)." },
            { text: "Sublingual nifedipine", isCorrect: false, explanation: "Calcium channel blockers have negative inotropic effects and are generally avoided in heart failure. Loop diuretics are the priority for fluid overload." }
        ]
    },
    {
        id: 41,
        category: "Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 30) + 40, // 40-69
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} presents with a 24-hour history of severe, colicky abdominal pain, multiple episodes of bilious vomiting, and marked abdominal distension. The patient has not passed flatus or stool for 18 hours. {subjCap} has a surgical history of an open appendectomy 10 years ago. On exam, high-pitched 'tinkling' bowel sounds are heard. What is the most appropriate initial conservative management strategy?",
        options: [
            { text: "NPO status, intravenous fluids, and nasogastric (NG) tube decompression", isCorrect: true, explanation: "The clinical presentation is classic for a Small Bowel Obstruction (crampy pain, bilious vomiting, distension, obstipation, surgical history). Initial management of uncomplicated SBO (no signs of strangulation/ischemia) consists of conservative therapy: NPO (nothing by mouth), IV fluid hydration, and nasogastric tube suctioning for decompression." },
            { text: "Immediate emergent exploratory laparotomy", isCorrect: false, explanation: "Emergent surgery is reserved for complicated bowel obstruction showing signs of bowel strangulation, necrosis, peritonitis, or when conservative management fails after 24-48 hours." },
            { text: "Oral administration of barium contrast to trace the obstruction", isCorrect: false, explanation: "Oral barium is highly thick and can worsen an obstruction. A water-soluble oral contrast (Gastrografin) is preferred, as it is both diagnostic and therapeutic (hyperosmolar agent that draws water to reduce wall edema)." },
            { text: "High-volume soap suds enema", isCorrect: false, explanation: "Enemas act on the colon and are ineffective for a mechanical small bowel obstruction, and can cause bowel perforation in the setting of high luminal pressures." },
            { text: "Initiate high-dose intravenous laxative therapy", isCorrect: false, explanation: "Laxatives are strictly contraindicated in mechanical bowel obstruction, as they can cause severe cramping, bowel ischemia, and rupture." }
        ]
    },
    {
        id: 42,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 20 // 20-34
        },
        text: "A {age}-year-old woman presents to the clinic with a 3-year history of severe dysmenorrhea (painful periods), deep dyspareunia (painful intercourse), and painful defecation during her periods (dyschezia). She also reports difficulty conceiving. Pelvic examination reveals normal uterine size but generalized pelvic tenderness. Transvaginal ultrasound is normal. What is the gold-standard diagnostic method?",
        options: [
            { text: "Laparoscopic visualization with biopsy of lesions", isCorrect: true, explanation: "The combination of dysmenorrhea, dyspareunia, dyschezia, and infertility is highly classic for Endometriosis. The gold-standard diagnostic method is direct visualization of ectopic endometrial tissue ('powder-burn' or 'chocolate' cyst lesions) via diagnostic laparoscopy, along with histological biopsy." },
            { text: "Magnetic Resonance Imaging (MRI) of the pelvis", isCorrect: false, explanation: "While MRI can identify deep infiltrating lesions or endometriomas, a normal scan cannot rule out superficial peritoneal endometriosis, making laparoscopy the gold standard." },
            { text: "Serum CA-125 level testing", isCorrect: false, explanation: "CA-125 can be elevated in endometriosis, but it is non-specific, can be raised in ovarian cancer, PID, or pregnancy, and is not a diagnostic test." },
            { text: "Diagnostic dilation and curettage (D&C)", isCorrect: false, explanation: "D&C samples the intrauterine endometrium and has no diagnostic utility for endometriosis, which is characterized by endometrial tissue located *outside* the uterine cavity." },
            { text: "Prescription of a 3-month trial of oral contraceptives", isCorrect: false, explanation: "A clinical trial of OCPs or NSAIDs is a common initial *management* step, but it is not a diagnostic gold-standard confirmation." }
        ]
    },
    {
        id: 43,
        category: "Infectious Diseases",
        vars: {
            age: () => Math.floor(Math.random() * 30) + 30, // 30-59
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 2-day history of worsening redness, warmth, and severe pain in {possessive} right lower leg. On physical exam, there is an erythematous, warm, edematous plaque on the right calf that is poorly demarcated and tender to the touch. The patient is afebrile. What is the most likely causative organism and appropriate initial oral therapy?",
        options: [
            { text: "Streptococcus pyogenes; Cephalexin", isCorrect: true, explanation: "The clinical presentation is classic for non-purulent Cellulitis (unilateral, warm, red, poorly demarcated skin infection). The most common causative pathogen is Streptococcus pyogenes (Group A Strep) followed by Staphylococcus aureus. First-line oral therapy for mild, non-purulent cellulitis is Cephalexin." },
            { text: "Staphylococcus epidermidis; Ciprofloxacin", isCorrect: false, explanation: "S. epidermidis is a normal skin commensal and rarely causes cellulitis. Ciprofloxacin (quinolone) lacks adequate Gram-positive coverage for cellulitis." },
            { text: "Pseudomonas aeruginosa; Amoxicillin", isCorrect: false, explanation: "Pseudomonas classically causes skin infections in wet environments (hot tub folliculitis, puncture through sneaker), and amoxicillin does not cover Pseudomonas." },
            { text: "Clostridium perfringens; Penicillin G", isCorrect: false, explanation: "Clostridium perfringens causes gas gangrene (clostridial myonecrosis), presenting with severe systemic toxicity, crepitus (gas in tissues), and rapidly progressive necrosis." },
            { text: "Streptococcus pneumoniae; Azithromycin", isCorrect: false, explanation: "S. pneumoniae causes pneumonia, otitis media, and meningitis, but is an extremely rare cause of soft tissue lower extremity cellulitis." }
        ]
    },
    {
        id: 44,
        category: "Pediatrics",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 9, // 9-23 months old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-month-old {gender} is brought to the clinic due to a 2-day history of high fever, irritability, and pullings at {possessive} right ear. On otoscopic examination, the right tympanic membrane is noted to be severely bulging, erythematous, opaque, and shows absent mobility on pneumatic otoscopy. What is the most appropriate first-line pharmacotherapy?",
        options: [
            { text: "High-dose oral Amoxicillin (80-90 mg/kg/day)", isCorrect: true, explanation: "The clinical symptoms and classic otoscopic signs (bulging, red, immobile TM) are diagnostic of Acute Otitis Media (AOM). First-line antibiotic of choice is high-dose oral Amoxicillin (80-90 mg/kg/day), which provides excellent middle-ear penetration against Streptococcus pneumoniae." },
            { text: "Prescribe topical Ciprofloxacin/Dexamethasone ear drops", isCorrect: false, explanation: "Topical ear drops are only effective for Otitis Externa (swimmer's ear) or AOM *if* the tympanic membrane is perforated or if tympanostomy tubes are present." },
            { text: "Prescribe oral Azithromycin syrup", isCorrect: false, explanation: "Azithromycin has higher rates of bacterial resistance among AOM pathogens and is reserved exclusively as a second-line option for patients with severe penicillin allergies." },
            { text: "Immediate surgical myringotomy and tympanostomy tube insertion", isCorrect: false, explanation: "Tympanostomy tubes are indicated for recurrent AOM (e.g., 3+ episodes in 6 months or 4+ in a year), not for a single, uncomplicated acute episode." },
            { text: "Reassurance and observation without any antibiotic therapy", isCorrect: false, explanation: "While watch-and-wait is an option for older children with mild unilateral symptoms, immediate antibiotic therapy is indicated for infants <2 years of age or children with severe systemic signs (high fever)." }
        ]
    },
    {
        id: 45,
        category: "Rheumatology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 50, // 50-69
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} with a history of gout presents with an acute, highly painful swelling and redness of the right knee that began 12 hours ago. The patient has been taking Allopurinol 300 mg daily for the past 6 months to prevent flares. Synovial fluid analysis confirms the presence of monosodium urate crystals. What is the most appropriate management of {possessive} Allopurinol therapy during this acute flare?",
        options: [
            { text: "Continue the current dose of Allopurinol 300 mg daily, and initiate an acute anti-inflammatory agent (NSAID or Colchicine)", isCorrect: true, explanation: "During an acute gouty arthritis flare, the current dose of Allopurinol should be *continued unchanged*. Stopping, starting, or altering the dose of urate-lowering therapy during an active flare can trigger sudden shifts in serum uric acid, extending or worsening the acute attack. Anti-inflammatory agents (NSAIDs, Colchicine, or systemic steroids) should be added to treat the acute pain." },
            { text: "Stop the Allopurinol immediately and restart it 2 weeks after the flare resolves", isCorrect: false, explanation: "Stopping Allopurinol during a flare destabilizes joint microcrystals, causing more crystals to shed and severely prolonging the acute inflammatory attack." },
            { text: "Double the dose of Allopurinol to 600 mg daily immediately to lower uric acid faster", isCorrect: false, explanation: "Increasing the dose of urate-lowering therapy during an acute flare is contraindicated as it rapidly lowers blood levels, triggering crystal destabilization and worsening joint inflammation." },
            { text: "Replace Allopurinol with oral Febuxostat immediately", isCorrect: false, explanation: "Switching urate-lowering agents during an active acute flare is highly inappropriate and will exacerbate the joint inflammation." },
            { text: "Discontinue all pharmacological treatments and recommend joint rest", isCorrect: false, explanation: "Flares are intensely painful and cause joint damage. Pharmacotherapy with anti-inflammatory agents is mandatory to alleviate pain and arrest inflammatory damage." }
        ]
    },
    {
        id: 46,
        category: "Emergency & Toxicology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 15, // 15-29
            gender: () => Math.random() > 0.5 ? 'female' : 'male',
            bp: () => `${Math.floor(Math.random() * 10) + 80}/${Math.floor(Math.random() * 10) + 50}` // 80-89 / 50-59
        },
        text: "A {age}-year-old {gender} is brought to the emergency department after accidentally ingesting a cookie containing peanuts. Within 15 minutes, {subj} developed diffuse urticaria (hives), swelling of the lips and tongue, severe wheezing, and a blood pressure of {bp} mmHg. What is the single most critical immediate therapeutic intervention?",
        options: [
            { text: "Intramuscular injection of Epinephrine (1:1,000) in the anterolateral thigh", isCorrect: true, explanation: "The patient is presenting in Anaphylactic Shock (hives, angioedema, respiratory distress, and hypotension). The single most critical, life-saving intervention is the immediate administration of intramuscular Epinephrine (0.3 mg for adults) into the anterolateral thigh (vastus lateralis) to reverse vasodilation and bronchoconstriction." },
            { text: "Intravenous administration of Diphenhydramine (Benadryl)", isCorrect: false, explanation: "Antihistamines are adjunctive therapies that treat skin symptoms but do *not* reverse life-threatening upper airway obstruction, bronchospasm, or hemodynamic collapse." },
            { text: "Intravenous high-dose Hydrocortisone infusion", isCorrect: false, explanation: "Corticosteroids are adjunctive therapies used to prevent late biphasic reactions, but they have a slow onset of action (4-6 hours) and are not effective in reversing acute airway or shock emergencies." },
            { text: "Inhaled Albuterol (Salbutamol) nebulization", isCorrect: false, explanation: "While albuterol helps with wheezing, it does not treat upper airway laryngeal edema or severe systemic vasodilation (hypotension). Epinephrine is the primary drug." },
            { text: "Intravenous fluid bolus of 2 Liters of normal saline", isCorrect: false, explanation: "While IV fluids are important support for refractory shock, they must be administered *after* or alongside the primary, essential dose of IM Epinephrine." }
        ]
    },
    {
        id: 47,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 22, // 22-33
            bp: () => `${Math.floor(Math.random() * 10) + 142}/${Math.floor(Math.random() * 6) + 92}` // 142-151 / 92-97
        },
        text: "A {age}-year-old pregnant woman, G1P0, at 28 weeks gestation presents for a routine prenatal visit. Her blood pressure is elevated at {bp} mmHg. She has no headache, visual disturbances, or right upper quadrant pain. Dipstick urinalysis shows no protein. Blood pressure repeated 4 hours later is {bp} mmHg. What is the most appropriate clinical diagnosis?",
        options: [
            { text: "Gestational Hypertension", isCorrect: true, explanation: "The patient has Gestational Hypertension, defined as new-onset systolic BP >= 140 mmHg and/or diastolic BP >= 90 mmHg occurring *after 20 weeks of gestation* in a previously normotensive woman, in the *absence* of proteinuria or any severe end-organ features of preeclampsia." },
            { text: "Preeclampsia without severe features", isCorrect: false, explanation: "Preeclampsia requires new-onset hypertension after 20 weeks *plus* new-onset proteinuria, or in the absence of proteinuria, signs of thrombocytopenia, renal insufficiency, impaired liver function, pulmonary edema, or cerebral symptoms." },
            { text: "Chronic Hypertension", isCorrect: false, explanation: "Chronic hypertension is defined as hypertension that is present *prior* to pregnancy or diagnosed *before 20 weeks* of gestation." },
            { text: "Preeclampsia with severe features", isCorrect: false, explanation: "Severe preeclampsia requires a BP >= 160/110 mmHg or any end-organ damage symptoms (headache, vision changes, severe thrombocytopenia, double AST/ALT), which are not present here." },
            { text: "Eclampsia", isCorrect: false, explanation: "Eclampsia is characterized by the new-onset of generalized tonic-clonic seizures in a woman with preeclampsia, which is not present here." }
        ]
    },
    {
        id: 48,
        category: "Neurology & Geriatrics",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 65, // 65-79
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is brought to the clinic by family members due to progressive walking difficulty and slowness. On physical exam, the patient displays a unilateral 'pill-rolling' resting tremor in the right hand, cogwheel rigidity of the limbs, a stooped posture with a slow, shuffling gait, and decreased facial expression (masked facies). What is the underlying pathophysiology and first-line treatment?",
        options: [
            { text: "Dopaminergic neuron loss in the substantia nigra; Levodopa-Carbidopa", isCorrect: true, explanation: "The patient is presenting with classic Parkinson's Disease (resting tremor, bradykinesia, rigidity, postural instability). The underlying pathology is the progressive loss of dopaminergic neurons in the substantia nigra pars compacta. First-line therapy of choice in symptomatic older adults is Levodopa-Carbidopa." },
            { text: "Demyelination of the corticospinal tracts; Interferon beta", isCorrect: false, explanation: "This describes the pathology of Multiple Sclerosis, which presents in young adults with acute focal neurological deficits separated in time and space." },
            { text: "Autoimmune destruction of acetylcholine receptors; Pyridostigmine", isCorrect: false, explanation: "This is the pathophysiology of Myasthenia Gravis, which typically presents with fluctuating muscle weakness, ptosis, diplopia, and bulbar symptoms worsened by exertion." },
            { text: "Loss of GABAergic neurons in the caudate nucleus; Tetrabenazine", isCorrect: false, explanation: "This is the classic pathology of Huntington's Disease, which presents in mid-life with chorea, progressive dementia, and psychiatric symptoms." },
            { text: "Amyloid plaque accumulation in the cerebral cortex; Donepezil", isCorrect: false, explanation: "This describes the pathology of Alzheimer's Dementia, which presents primarily with progressive short-term memory impairment rather than primary parkinsonian motor signs." }
        ]
    },
    {
        id: 49,
        category: "Gastroenterology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 20, // 20-34
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} presents with a 9-month history of recurrent abdominal pain that occurs at least 1 day per week. The pain is consistently relieved following defecation and is associated with a change in the frequency and consistency of {possessive} stool, fluctuating between watery diarrhea and hard, pellet-like stools. There is no blood in the stool, no weight loss, and no nocturnal symptoms. Laboratory work and colonoscopy are normal. What is the most likely diagnosis?",
        options: [
            { text: "Irritable Bowel Syndrome (IBS)", isCorrect: true, explanation: "The patient meets the Rome IV criteria for Irritable Bowel Syndrome: recurrent abdominal pain at least 1 day/week over the last 3 months, associated with defecation, and changes in stool frequency/form, without any alarm ('red flag') features (weight loss, blood, nocturnal awakening)." },
            { text: "Crohn's Disease", isCorrect: false, explanation: "Crohn's is an inflammatory bowel disease characterized by transmural skip lesions, which typically presents with chronic diarrhea, abdominal pain, fever, weight loss, and inflammatory findings on colonoscopy (cobblestoning, granulomas)." },
            { text: "Ulcerative Colitis", isCorrect: false, explanation: "Ulcerative colitis is characterized by continuous mucosal inflammation starting in the rectum, presenting with bloody diarrhea, tenesmus, and inflammatory findings on colonoscopy." },
            { text: "Celiac Disease", isCorrect: false, explanation: "While Celiac presents with chronic diarrhea and bloating, it is associated with malabsorption, weight loss, iron-deficiency anemia, positive IgA tTG antibodies, and villous atrophy on biopsy." },
            { text: "Chronic bacterial gastroenteritis", isCorrect: false, explanation: "Bacterial infections cause acute, self-limiting diarrhea, not intermittent, fluctuating symptoms spanning 9 months with normal lab values." }
        ]
    },
    {
        id: 50,
        category: "Pediatrics & Pulmonology",
        vars: {
            age: () => Math.floor(Math.random() * 10) + 5, // 5-14 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-year-old {gender} is brought to the clinic due to a 2-week history of a subacute, persistent dry cough, a low-grade fever, and mild wheezing. On exam, the child is active and does not appear toxic. Chest X-ray reveals diffuse, bilateral interstitial infiltrates that look far worse than the clinical examination suggests. What is the most likely causative pathogen and the treatment of choice?",
        options: [
            { text: "Mycoplasma pneumoniae; Azithromycin (Macrolide)", isCorrect: true, explanation: "The presentation is classic for atypical ('walking') pneumonia, most commonly caused by Mycoplasma pneumoniae in school-aged children. Characterized by a subacute onset, dry cough, low-grade fever, and interstitial infiltrates out of proportion to exam findings. First-line therapy is a macrolide (such as Azithromycin)." },
            { text: "Streptococcus pneumoniae; High-dose Amoxicillin", isCorrect: false, explanation: "S. pneumoniae causes classic bacterial lobar pneumonia, presenting with acute onset of high fever, toxic appearance, productive cough, and lobar consolidation (not diffuse interstitial infiltrates)." },
            { text: "Pneumocystis jirovecii; Trimethoprim-sulfamethoxazole (TMP-SMX)", isCorrect: false, explanation: "P. jirovecii causes severe pneumonia in immunocompromised individuals (e.g., untreated HIV/AIDS), not in healthy, active school-aged children." },
            { text: "Respiratory Syncytial Virus (RSV); Nebulized Ribavirin", isCorrect: false, explanation: "RSV is a common cause of bronchiolitis in infants <2 years, but is a rare cause of interstitial walking pneumonia in older, school-aged children." },
            { text: "Chlamydia trachomatis; Oral Penicillin V", isCorrect: false, explanation: "C. trachomatis causes a classic staccato cough and interstitial pneumonia in infants aged 1 to 3 months, not in school-aged children, and Penicillin is ineffective against atypical bacteria." }
        ]
    },
    {
        id: 51,
        category: "Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 6) + 14 // 14-19
        },
        text: "A {age}-year-old girl is brought to the clinic by her parents due to severe weight loss. She states she feels 'fat' despite having a body weight that is 70% of her expected weight (BMI of 15.2 kg/m²). She restricts her food intake to less than 400 calories a day and exercises intensely. Her blood pressure is 82/45 mmHg, heart rate is 36 bpm, and potassium is 2.8 mmol/L. What is the most appropriate immediate setting of care?",
        options: [
            { text: "Inpatient medical admission", isCorrect: true, explanation: "The patient has Anorexia Nervosa and is presenting with severe medical instability: extreme bradycardia (HR 36 bpm), severe hypotension (BP 82/45 mmHg), and dangerous hypokalemia (Potassium 2.8 mmol/L). Immediate inpatient medical admission is mandatory to stabilize electrolytes, monitor cardiac function, and initiate safe, controlled refeeding to prevent refeeding syndrome." },
            { text: "Outpatient cognitive behavioral therapy (CBT)", isCorrect: false, explanation: "While CBT is the cornerstone of long-term therapy for anorexia, outpatient care is highly unsafe and contraindicated in patients with acute hemodynamic instability or severe electrolyte abnormalities." },
            { text: "Inpatient psychiatric unit admission", isCorrect: false, explanation: "The patient requires urgent medical stabilization of her bradycardia (HR 36) and hypokalemia (potassium 2.8). Admission to a standard psychiatric unit is incorrect, as these units are generally not equipped to manage high-acuity medical and cardiac monitoring." },
            { text: "Enrollment in an intensive outpatient eating disorder day program", isCorrect: false, explanation: "Day programs are highly effective for stable patients transitioning from inpatient care, but are entirely inappropriate for someone in active cardiovascular distress." },
            { text: "Discharge home with an oral potassium supplement and weekly weigh-ins", isCorrect: false, explanation: "Discharging a severely malnourished patient with active cardiovascular instability (HR 36) is a critical safety risk. Potassium shifts during refeeding can trigger fatal arrhythmias." }
        ]
    },
    {
        id: 52,
        category: "Surgery & Gastroenterology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 40, // 40-59
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} presents with a 2-day history of constant, severe right upper quadrant (RUQ) abdominal pain, dark urine, and pale stools. On physical exam, there is visible scleral icterus and mild jaundice. Laboratory studies reveal highly elevated direct bilirubin and alkaline phosphatase. Ultrasound shows a dilated common bile duct (11 mm) and multiple gallstones in the gallbladder. What is the preferred diagnostic and therapeutic intervention?",
        options: [
            { text: "Endoscopic Retrograde Cholangiopancreatography (ERCP)", isCorrect: true, explanation: "The patient has Choledocholithiasis (a gallstone obstructing the common bile duct, causing obstructive jaundice: direct hyperbilirubinemia, high Alk Phos, pale stools, dark urine). The preferred diagnostic and therapeutic modality is ERCP, which allows for direct cholangiography, sphincterotomy, and extraction of the obstructing stone." },
            { text: "Laparoscopic Cholecystectomy (immediate)", isCorrect: false, explanation: "While a cholecystectomy is indicated to prevent future gallstone complications, the common bile duct stone must be cleared *first* (via ERCP) to relieve the active biliary obstruction and prevent ascending cholangitis or gallstone pancreatitis." },
            { text: "Percutaneous Transhepatic Cholangiography (PTC)", isCorrect: false, explanation: "PTC is an invasive alternative used to drain the biliary tree when ERCP is unavailable, unsuccessful, or contraindicated (e.g., due to prior gastric bypass surgery)." },
            { text: "Initiate oral ursodeoxycholic acid therapy", isCorrect: false, explanation: "Ursodeoxycholic acid is a bile acid used to slowly dissolve small cholesterol gallstones in patients who are unfit for surgery; it plays no role in resolving acute common bile duct obstruction." },
            { text: "Order an urgent HIDA scan", isCorrect: false, explanation: "A HIDA scan is used to diagnose acute cholecystitis when ultrasound is equivocal; it is not indicated for choledocholithiasis, which is already clearly suggested by ultrasound (dilated CBD) and labs." }
        ]
    },
    {
        id: 53,
        category: "Hematology",
        vars: {
            age: () => Math.floor(Math.random() * 25) + 40, // 40-64
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 3-day history of unilateral left calf pain, swelling, and warmth. {subjCap} underwent major total knee replacement surgery 2 weeks ago and has been relatively immobile since. On exam, there is a 4 cm discrepancy in calf circumference compared to the right side. What is the most appropriate next step to confirm the diagnosis, and the appropriate therapy?",
        options: [
            { text: "Compression Duplex Ultrasound of the lower extremity; Oral Anticoagulation (DOAC)", isCorrect: true, explanation: "The clinical presentation is classic for a Deep Vein Thrombosis (DVT) in the setting of major orthopedic surgery and immobility. The diagnostic test of choice to confirm DVT is a compression duplex ultrasound of the lower extremity. Once confirmed, first-line therapy is anticoagulation (typically a Direct Oral Anticoagulant like Apixaban or Rivaroxaban)." },
            { text: "Order a serum D-dimer test; if positive, initiate daily Aspirin 325 mg", isCorrect: false, explanation: "A D-dimer is a screening tool with high sensitivity but low specificity; it is universally elevated after surgery and cannot confirm a DVT. Aspirin is an antiplatelet agent and is not appropriate for treating a venous thrombosis." },
            { text: "Perform a lower extremity venography; if positive, schedule an emergent embolectomy", isCorrect: false, explanation: "Venography is invasive and obsolete since the advent of ultrasound. Embolectomy is reserved for limb-threatening phlegmasia cerulea dolens, not uncomplicated DVT." },
            { text: "Immediately administer Low-Molecular-Weight Heparin without any imaging", isCorrect: false, explanation: "While anticoagulation is crucial, a diagnostic duplex ultrasound must be obtained first to confirm the diagnosis, unless there is a high-suspicion patient with delayed access to imaging." },
            { text: "Order a chest CT angiogram; if negative, prescribe 1 week of bed rest", isCorrect: false, explanation: "A CT angiogram is used to diagnose pulmonary embolism, not leg DVT. Bed rest is actually contraindicated in DVT, as early mobilization is encouraged once anticoagulated." }
        ]
    },
    {
        id: 54,
        category: "Internal Medicine",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 65, // 65-79
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} with a 40 pack-year history of cigarette smoking and documented severe COPD presents to the clinic. {subjCap} reports a 3-day history of worsening shortness of breath, a significant increase in the volume of {possessive} daily sputum, and the sputum has become thick and green (purulent). What is the most appropriate outpatient therapeutic regimen?",
        options: [
            { text: "Inhaled short-acting bronchodilators, a 5-day course of oral Prednisone, and oral antibiotics", isCorrect: true, explanation: "The patient is experiencing an Acute COPD Exacerbation. According to the Anthonisen criteria, patients with all three cardinal symptoms (increased dyspnea, increased sputum volume, and increased sputum purulence) benefit from oral antibiotics. Management also includes short-acting bronchodilators (SABA+SAMA) and systemic corticosteroids (Prednisone 40 mg daily for 5 days)." },
            { text: "Oral antibiotics only, with instructions to discontinue all maintenance inhalers", isCorrect: false, explanation: "Inhalers should never be stopped during an exacerbation; bronchodilator therapy is essential to alleviate airway obstruction." },
            { text: "High-dose inhaled fluticasone monotherapy and bed rest", isCorrect: false, explanation: "Inhaled corticosteroids are not used as monotherapy for acute COPD exacerbations, and do not replace the need for systemic steroids (prednisone) and antibiotics." },
            { text: "Immediate hospitalization for continuous intravenous aminophylline infusion", isCorrect: false, explanation: "Aminophylline has a narrow therapeutic window and significant toxicity, and is no longer recommended for COPD exacerbations. This patient has mild-to-moderate symptoms suitable for outpatient management." },
            { text: "Initiate daily home oxygen therapy at 4 Liters per minute", isCorrect: false, explanation: "Home oxygen is only indicated for chronic severe hypoxemia (PaO2 <= 55 mmHg or SaO2 <= 88% at rest). Administering high-flow oxygen to a COPD patient can suppress their hypoxic drive and cause severe hypercapnic respiratory failure." }
        ]
    },
    {
        id: 55,
        category: "Pediatrics & Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 6) + 12 // 12-17 years old
        },
        text: "A {age}-year-old boy is brought to the emergency department in severe distress with a sudden-onset, excruciating pain in his left scrotum that woke him up 3 hours ago. He has vomited once. On physical examination, the left testis is noted to be swollen, exquisitely tender, and high-riding with a horizontal lie. The left cremasteric reflex is absent. What is the most appropriate next step in management?",
        options: [
            { text: "Emergent surgical exploration and bilateral orchiopexy", isCorrect: true, explanation: "The presentation is classic for Testicular Torsion (sudden excruciating pain, high-riding horizontal testis, absent cremasteric reflex, in an adolescent). Testicular torsion is a surgical emergency with a 6-hour viability window. Emergent surgical exploration and detorsion with bilateral orchiopexy (anchoring both testes to prevent recurrence) is the definitive treatment. Surgery should not be delayed for imaging if the clinical suspicion is high." },
            { text: "Order a Doppler ultrasound of the scrotum, and wait for results", isCorrect: false, explanation: "While a Doppler ultrasound showing decreased blood flow is diagnostic, if surgical exploration is immediately available, you should proceed directly to the operating room to avoid wasting precious time within the 6-hour viability window." },
            { text: "Attempt manual detorsion by rotating the testis outward (open-book maneuver) and discharge", isCorrect: false, explanation: "While manual detorsion can be attempted as a temporary bridge to surgery, it is highly painful, often unsuccessful, and does *not* replace the need for definitive surgical exploration and bilateral orchiopexy." },
            { text: "Prescribe oral Amoxicillin for suspected epididymitis, and follow up in 1 week", isCorrect: false, explanation: "Misdiagnosing testicular torsion as epididymitis is a catastrophic clinical error. Epididymitis typically presents with gradual pain, dysuria, and a preserved cremasteric reflex, and is rare in post-pubertal boys without sexual history." },
            { text: "Apply an ice pack, prescribe oral ibuprofen, and recommend bed rest", isCorrect: false, explanation: "Testicular torsion is a vascular occlusion emergency. Conservative therapy alone will result in complete testicular infarction, necrosis, and loss of the testis." }
        ]
    },
    {
        id: 56,
        category: "Infectious Diseases & Emergency",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 18, // 18-32
            gender: () => Math.random() > 0.5 ? 'male' : 'female',
            temp: () => (Math.random() * 0.8 + 38.6).toFixed(1) // 38.6 - 39.3 °C
        },
        text: "A {age}-year-old {gender} is brought to the emergency department with a 12-hour history of severe headache, photophobia, high fever of {temp}°C, and a stiff neck. On examination, the patient is lethargic and has positive Kernig and Brudzinski signs. A petechial rash is noted on the lower extremities. What is the most appropriate next step in management?",
        options: [
            { text: "Perform an emergent lumbar puncture, followed immediately by intravenous Ceftriaxone, Vancomycin, and Dexamethasone", isCorrect: true, explanation: "The presentation is diagnostic of Acute Bacterial Meningitis (fever, neck stiffness, photophobia, Kernig/Brudzinski signs, petechial rash likely due to Neisseria meningitidis). Emergent lumbar puncture should be performed immediately to obtain CSF cultures, followed *immediately* by empirical broad-spectrum IV antibiotics (Ceftriaxone + Vancomycin) and IV Dexamethasone (to reduce hearing loss and neurological sequelae)." },
            { text: "Order a brain CT scan and wait for results before starting any antibiotics", isCorrect: false, explanation: "While a CT scan is indicated if there are focal deficits or signs of increased ICP (papilledema), delaying antibiotics in bacterial meningitis is associated with high mortality. If LP or CT is delayed, empirical antibiotics must be started immediately *before* imaging." },
            { text: "Perform a lumbar puncture, and wait for CSF Gram stain results before administering medications", isCorrect: false, explanation: "Never delay life-saving antibiotic therapy while waiting for laboratory results (such as Gram stain or cultures) when bacterial meningitis is suspected." },
            { text: "Prescribe oral Ciprofloxacin and recommend home quarantine", isCorrect: false, explanation: "Acute bacterial meningitis is a life-threatening medical emergency requiring high-dose intravenous bactericidal antibiotics, not oral outpatient treatments." },
            { text: "Initiate intravenous Acyclovir and isolate the patient in a negative pressure room", isCorrect: false, explanation: "IV Acyclovir is used to treat Herpes Simplex Virus (HSV) encephalitis, which presents with focal deficits, seizures, and altered behavior, not classic petechial bacterial meningitis." }
        ]
    },
    {
        id: 57,
        category: "Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 15, // 15-29
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 24-hour history of abdominal pain. The pain initially began as a dull ache around {possessive} umbilicus, but has now migrated to the right lower quadrant (RLQ) and become sharp and constant. {subjCap} has a low-grade fever, mild nausea, and anorexia. On exam, there is tenderness at McBurney's point, and deep palpation of the left lower quadrant reproduces pain in the RLQ (Rovsing's sign). What is the most likely diagnosis?",
        options: [
            { text: "Acute Appendicitis", isCorrect: true, explanation: "The migration of pain from the periumbilical region to the RLQ, low-grade fever, anorexia ('hamburger sign'), McBurney's point tenderness, and a positive Rovsing's sign are highly diagnostic of Acute Appendicitis. Laparoscopic appendectomy is the treatment of choice." },
            { text: "Acute Gastroenteritis", isCorrect: false, explanation: "Gastroenteritis features diffuse crampy abdominal pain, prominent watery diarrhea, and hyperactive bowel sounds, rather than localized peritoneal RLQ tenderness." },
            { text: "Meckel's Diverticulitis", isCorrect: false, explanation: "While Meckel's can mimic appendicitis, it is much less common and typically presents in very young children with painless hematochezia (lower GI bleeding) rather than classic migratory RLQ pain." },
            { text: "Ruptured Ovarian Cyst", isCorrect: false, explanation: "A ruptured cyst causes sudden-onset, sharp unilateral lower abdominal pain, often triggered by strenuous activity or intercourse, without the prodromal periumbilical pain and fever." },
            { text: "Crohn's Disease exacerbation", isCorrect: false, explanation: "While Crohn's can cause terminal ileitis mimicking RLQ pain, it presents with a chronic history of intermittent abdominal pain, chronic bloody diarrhea, weight loss, and anemia." }
        ]
    },
    {
        id: 58,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 20, // 20-39
            bp: () => `${Math.floor(Math.random() * 10) + 90}/${Math.floor(Math.random() * 8) + 55}` // 90-99 / 55-62 mmHg
        },
        text: "A {age}-year-old woman presents to the emergency department with sharp, left-sided lower abdominal pain and light vaginal spotting. Her last menstrual period was 6 weeks ago. Her blood pressure is {bp} mmHg and heart rate is 102 bpm. Beta-hCG is positive at 3,200 mIU/mL. Transvaginal ultrasound reveals an empty uterus and a 3.5 cm left adnexal mass with a visible yolk sac. There is no free fluid in the pelvis. What is the most appropriate management?",
        options: [
            { text: "Intramuscular Methotrexate therapy", isCorrect: true, explanation: "The patient has an unruptured Ectopic Pregnancy (adnexal mass, empty uterus, positive hCG, LMP 6 weeks ago). Because she is hemodynamically stable (BP {bp} mmHg), has a small ectopic mass (<4 cm), no fetal cardiac activity, no rupture/free fluid, and an hCG < 5,000, she is an excellent candidate for medical management with intramuscular Methotrexate." },
            { text: "Emergent exploratory laparotomy with left salpingectomy", isCorrect: false, explanation: "Emergent laparotomy or laparoscopy is indicated for ruptured ectopic pregnancy (hemodynamic instability, peritonitis, massive hemoperitoneum), not for an unruptured, stable ectopic gestation." },
            { text: "Dilatation and Curettage (D&C)", isCorrect: false, explanation: "D&C is used to manage spontaneous intrauterine abortions, but is contraindicated and useless in ectopic pregnancy since the pregnancy is located outside the uterine cavity." },
            { text: "Expectant management with repeat beta-hCG in 48 hours", isCorrect: false, explanation: "Expectant management is only safe for asymptomatic, resolving ectopic pregnancies with low, self-declining hCG levels (<1,000). With a visible yolk sac and hCG of 3,200, intervention is required." },
            { text: "Initiate oral mifepristone and misoprostol", isCorrect: false, explanation: "Mifepristone/misoprostol are used for medical termination of *intrauterine* pregnancies, not for ectopic gestations, where they carry a high risk of rupture and fatal hemorrhage." }
        ]
    },
    {
        id: 59,
        category: "Cardiology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 20, // 20-39
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 2-day history of sharp, constant retrosternal chest pain. The pain is severely worsened when lying flat on {possessive} back and when taking a deep breath, and is significantly improved when sitting up and leaning forward. On auscultation, a high-pitched scratching sound is heard at the left lower sternal border. ECG shows diffuse, upward-sloping ST segment elevations. What is the first-line pharmacotherapy?",
        options: [
            { text: "High-dose Ibuprofen (NSAID) plus Colchicine", isCorrect: true, explanation: "The clinical presentation is highly classic for Acute Pericarditis (pleuritic chest pain worsened by lying flat and improved by sitting up, pericardial friction rub, and diffuse ST elevations with PR depressions). First-line therapy is high-dose NSAIDs (like Ibuprofen or Aspirin) combined with Colchicine (which reduces recurrence rates and speeds recovery)." },
            { text: "Emergent cardiac catheterization and primary PCI", isCorrect: false, explanation: "While diffuse ST elevations can mimic a STEMI, the classic positional chest pain, friction rub, and diffuse (rather than localized anatomical) ST elevations point to pericarditis. Invasive catheterization is not indicated." },
            { text: "Intravenous Heparin and sublingual Nitroglycerin", isCorrect: false, explanation: "Heparin and nitroglycerin are used to treat acute coronary syndromes. In pericarditis, anticoagulants like heparin are contraindicated as they can cause hemorrhagic tamponade." },
            { text: "High-dose oral Prednisone monotherapy", isCorrect: false, explanation: "Systemic corticosteroids are second-line for pericarditis and are associated with increased recurrence rates. They are reserved for patients with contraindications to NSAIDs or autoimmune causes." },
            { text: "Intravenous Ceftriaxone", isCorrect: false, explanation: "Most cases of acute pericarditis are viral or idiopathic, not bacterial. Antibiotics are not indicated unless there is evidence of purulent bacterial pericarditis." }
        ]
    },
    {
        id: 60,
        category: "Pediatrics & Surgery",
        vars: {
            age: () => Math.floor(Math.random() * 3) + 3 // 3-5 weeks old
        },
        text: "A {age}-week-old first-born male infant is brought to the clinic due to worsening non-bilious projectile vomiting after every feeding over the past week. The infant is constantly hungry and eager to feed again immediately after vomiting. On physical exam, the child appears mildly dehydrated, and a small, firm, mobile 'olive-shaped' mass is palpable in the epigastrium. Laboratory studies reveal hypokalemic, hypochloremic metabolic alkalosis. What is the most appropriate next step in management?",
        options: [
            { text: "Intravenous fluid resuscitation with D5NS + Potassium to correct electrolytes, followed by surgical pyloromyotomy", isCorrect: true, explanation: "The infant has Hypertrophic Pyloric Stenosis (projectile non-bilious vomiting, olive-shaped mass, typical age 3-6 weeks). The vomiting of gastric acid leads to a classic hypokalemic hypochloremic metabolic alkalosis. The most critical immediate step is to correct the dehydration and electrolyte/acid-base disturbances with IV fluids before surgery. Once stable, the definitive treatment is a surgical pyloromyotomy (Fredet-Ramstedt procedure)." },
            { text: "Immediate emergent surgical pyloromyotomy without waiting for labs", isCorrect: false, explanation: "Pyloromyotomy is not an emergency. Performing surgery on an infant with active metabolic alkalosis and electrolyte imbalances is highly dangerous due to an increased risk of post-anesthetic apnea." },
            { text: "Switch the infant's formula to a hydrolyzed, hypoallergenic brand", isCorrect: false, explanation: "Pyloromyotomy is a mechanical muscular hypertrophy obstruction. Changing formula will not resolve the obstruction and will only delay necessary treatment." },
            { text: "Perform an emergent upper gastrointestinal barium swallow series", isCorrect: false, explanation: "While a barium swallow can show a 'string sign', ultrasound is the diagnostic imaging modality of choice (safe, avoids radiation, and measures pyloric muscle thickness). An upper GI series is not the first line." },
            { text: "Prescribe oral metoclopramide to stimulate gastric emptying", isCorrect: false, explanation: "Prokinetic medications are useless and dangerous in a mechanical obstruction like pyloric stenosis, where they can cause gastric rupture." }
        ]
    },
    {
        id: 61,
        category: "Internal Medicine & Rheumatology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 35, // 35-54
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} presents with a 6-month history of bilateral, symmetrical pain and swelling in the wrists, metacarpophalangeal (MCP) joints, and proximal interphalangeal (PIP) joints. The patient reports severe stiffness in these joints every morning that lasts for about 2 hours before gradually improving with movement. What is the first-line disease-modifying antirheumatic drug (DMARD) of choice?",
        options: [
            { text: "Methotrexate", isCorrect: true, explanation: "The presentation of chronic, symmetrical, microcytic small joint pain with prolonged morning stiffness (>1 hour) is classic for Rheumatoid Arthritis. The first-line DMARD of choice for all patients with moderate-to-severe RA is Methotrexate, which should be initiated early to prevent joint destruction. Folate supplementation is co-prescribed." },
            { text: "Daily high-dose Naproxen (NSAID) monotherapy", isCorrect: false, explanation: "NSAIDs provide symptomatic pain relief but do *not* prevent progressive bone erosion, joint destruction, or halt disease progression, so they should never be used as monotherapy." },
            { text: "Infliximab (TNF-alpha inhibitor)", isCorrect: false, explanation: "Biologic DMARDs like Infliximab are highly effective but are reserved as second-line therapies for patients who fail to respond to standard non-biologic DMARDs (like Methotrexate)." },
            { text: "Oral Prednisone 40 mg daily as long-term maintenance", isCorrect: false, explanation: "Glucocorticoids are highly useful as short-term 'bridge' therapy while waiting for DMARDs to take effect (which takes weeks), but long-term use is avoided due to severe side effects." },
            { text: "Oral Allopurinol", isCorrect: false, explanation: "Allopurinol is a urate-lowering agent used to treat chronic gouty tophi, not Rheumatoid Arthritis, which is an autoimmune inflammatory disorder." }
        ]
    },
    {
        id: 62,
        category: "Emergency & Toxicology",
        vars: {
            age: () => Math.floor(Math.random() * 30) + 20, // 20-49
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "During a cold winter month, a {age}-year-old {gender} is brought to the emergency department after being found confused in {possessive} apartment. {subjCap} has a severe headache, nausea, and dizziness. On exam, the skin and mucous membranes appear cherry-red. Pulse oximetry reads 99% on room air. An old, unvented kerosene space heater was running in {possessive} bedroom. What is the diagnostic test of choice and immediate management?",
        options: [
            { text: "Measure arterial carboxyhemoglobin level; administer 100% high-flow normobaric oxygen via non-rebreather mask", isCorrect: true, explanation: "The patient has Carbon Monoxide (CO) Poisoning from the kerosene heater. CO has a 200x higher affinity for hemoglobin than oxygen, forming carboxyhemoglobin. Pulse oximetry is misleadingly normal (99%) because standard oximeters cannot distinguish carboxyhemoglobin from oxyhemoglobin. The diagnostic test of choice is an arterial/venous blood gas carboxyhemoglobin level. First-line management is immediate high-flow 100% oxygen to shorten the half-life of carboxyhemoglobin." },
            { text: "Measure arterial pO2; administer nebulized salbutamol and intravenous saline", isCorrect: false, explanation: "Arterial pO2 measures dissolved oxygen in plasma, which is normal in CO poisoning since CO binds to hemoglobin. Salbutamol does not treat CO toxicity." },
            { text: "Obtain an emergent chest X-ray; prepare for endotracheal intubation", isCorrect: false, explanation: "A chest X-ray is normal in CO poisoning, and intubation is only indicated if there is respiratory failure or deep coma, not for confusion and headache alone." },
            { text: "Order a serum methemoglobin level; administer intravenous methylene blue", isCorrect: false, explanation: "Methylene blue is the antidote for methemoglobinemia (caused by local anesthetics or dapsone, presenting with cyanosis and chocolate-brown blood), not CO poisoning." },
            { text: "Order a brain MRI to check for ischemia; initiate intravenous tissue plasminogen activator (tPA)", isCorrect: false, explanation: "While severe CO poisoning can cause globus pallidus necrosis on MRI, the primary treatment is oxygen. tPA is contraindicated and dangerous." }
        ]
    },
    {
        id: 63,
        category: "Obstetrics & Gynecology",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 25, // 25-39
            gest: () => Math.floor(Math.random() * 4) + 32 // 32-35 weeks
        },
        text: "A {age}-year-old pregnant woman at {gest} weeks gestation presents to the triage unit with sudden-onset, painless, bright red vaginal bleeding. She reports normal fetal movement. On physical examination, her abdomen is soft, relaxed, and non-tender. Fetal heart rate tracing is reassuring (Category I) showing no decelerations. What is the most critical contraindication in this patient's immediate workup?",
        options: [
            { text: "Performing a digital pelvic (cervical) examination", isCorrect: true, explanation: "The presentation is highly classic for Placenta Previa (painless, bright red vaginal bleeding, soft non-tender uterus in the third trimester). Performing a digital vaginal exam is strictly *contrindicated* until placenta previa is ruled out by ultrasound, as finger contact can trigger catastrophic, life-threatening maternal hemorrhage by tearing the low-lying placenta." },
            { text: "Performing a transvaginal ultrasound", isCorrect: false, explanation: "Transvaginal ultrasound is actually the gold-standard diagnostic method to locate the placenta. It is safe because the probe angle is controlled and it does not enter the cervix." },
            { text: "Initiating continuous external fetal heart rate monitoring", isCorrect: false, explanation: "Continuous fetal monitoring is safe, non-invasive, and essential to ensure fetal well-being in the setting of maternal third-trimester bleeding." },
            { text: "Administering a dose of intramuscular Betamethasone", isCorrect: false, explanation: "Antenatal corticosteroids (Betamethasone) are indicated in this patient to promote fetal lung maturity, as she is at high risk of preterm delivery ({gest} weeks)." },
            { text: "Obtaining a complete blood count and coagulation panel", isCorrect: false, explanation: "Drawing maternal blood for type/screen and CBC is essential to prepare for potential blood transfusion and assess blood loss." }
        ]
    },
    {
        id: 64,
        category: "Neurology & Emergency",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 65, // 65-79
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is brought to the emergency department by a family member who noticed the sudden onset of slurred speech and severe weakness in the patient's right face, arm, and leg that began exactly 2 hours ago. On exam, the patient is hypertensive at 170/95 mmHg, has a motor aphasia, and dense right-sided hemiparesis. What is the most critical immediate diagnostic step?",
        options: [
            { text: "Non-contrast Computed Tomography (CT) of the head", isCorrect: true, explanation: "The patient is presenting with acute stroke symptoms. The single most critical, time-sensitive first step is a non-contrast head CT scan. This scan is essential to rule out a hemorrhagic stroke (visible as hyperdensity). If hemorrhage is excluded and no contraindications exist, the patient can receive IV tissue plasminogen activator (tPA) within the 4.5-hour therapeutic window." },
            { text: "Intravenous administration of tissue plasminogen activator (tPA)", isCorrect: false, explanation: "While tPA is the definitive treatment for acute ischemic stroke, it should *never* be given before obtaining a head CT, as administering tPA to a patient with an active hemorrhagic stroke is fatal." },
            { text: "Magnetic Resonance Imaging (MRI) of the brain", isCorrect: false, explanation: "While MRI is highly sensitive for early ischemic changes (DWI sequence), it is slow, expensive, and delays crucial time-sensitive stroke care compared to a rapid head CT scan." },
            { text: "Lumbar puncture to rule out subarachnoid hemorrhage", isCorrect: false, explanation: "A lumbar puncture is reserved for cases where there is high suspicion of subarachnoid hemorrhage (thunderclap headache) but the head CT is negative, which is not the presentation here." },
            { text: "Intravenous bolus of high-dose heparin", isCorrect: false, explanation: "Heparin has no role in the acute management of ischemic stroke and increases the risk of symptomatic intracranial hemorrhage without improving outcomes." }
        ]
    },
    {
        id: 65,
        category: "Gastroenterology",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 45, // 45-64
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 6-month history of a burning sensation in {possessive} substernal chest that occurs 30 minutes after eating, especially after heavy or spicy meals. The pain is worsened when lying flat and is partially relieved by over-the-counter antacids. {subjCap} has no difficulty swallowing, no weight loss, and no blood in {possessive} stool. What is the most appropriate initial management strategy?",
        options: [
            { text: "Initiate lifestyle modifications and prescribe a daily Proton Pump Inhibitor (PPI) trial for 8 weeks", isCorrect: true, explanation: "The patient has classic Gastroesophageal Reflux Disease (GERD) without any 'alarm features' (dysphagia, odynophagia, weight loss, anemia, hematemesis). In the absence of alarm symptoms, a presumptive diagnosis of GERD can be made, and the first-line management is lifestyle changes (elevate head of bed, avoid trigger foods) and an 8-week trial of a daily PPI." },
            { text: "Schedule an urgent upper endoscopy (EGD) to rule out esophageal malignancy", isCorrect: false, explanation: "Endoscopy is not indicated as an initial step in young/middle-aged patients with uncomplicated classic GERD. It is reserved for patients with alarm features, long-standing disease (>5 years with risk factors for Barrett's), or those who fail PPI therapy." },
            { text: "Order a 24-hour ambulatory esophageal pH impedance study", isCorrect: false, explanation: "A 24-hour pH study is the gold standard for diagnosing GERD, but it is invasive and reserved for patients with refractory symptoms despite PPI therapy, prior to anti-reflux surgery." },
            { text: "Refer the patient for a laparoscopic Nissen fundoplication", isCorrect: false, explanation: "Surgical fundoplication is an invasive anti-reflux procedure reserved for patients who fail, are intolerant to, or refuse long-term medical PPI therapy." },
            { text: "Prescribe oral Amoxicillin, Clarithromycin, and Omeprazole for 14 days", isCorrect: false, explanation: "This triple-therapy regimen is used to eradicate Helicobacter pylori in peptic ulcer disease, which presents with epigastric gnawing pain, not classic retrosternal GERD heartburn." }
        ]
    },
    {
        id: 66,
        category: "Pediatrics & Emergency",
        vars: {
            age: () => Math.floor(Math.random() * 2) + 1, // 1-2 years old
            gender: () => Math.random() > 0.5 ? 'boy' : 'girl'
        },
        text: "A {age}-year-old {gender} is brought to the emergency department after a sudden onset of choking and coughing while playing in a room with small toys. The child is currently stable but has a persistent, dry cough. On physical examination, there is unilateral expiratory wheezing and significantly decreased breath sounds over the right lung field. What is the gold-standard diagnostic and therapeutic method?",
        options: [
            { text: "Rigid Bronchoscopy", isCorrect: true, explanation: "The clinical presentation is classic for a Foreign Body Aspiration (sudden-onset choking, unilateral wheezing, decreased breath sounds, typical toddler age). The gold-standard diagnostic and therapeutic method is urgent **Rigid Bronchoscopy**, which allows for direct visualization and safe removal of the foreign object from the airway." },
            { text: "Flexible Bronchoscopy", isCorrect: false, explanation: "While flexible bronchoscopy is excellent for diagnostic visualization of smaller airways, it lacks the rigid channel and instrumentation necessary to secure the airway and safely retrieve foreign bodies, which requires a rigid bronchoscope." },
            { text: "Obtain a chest CT scan with intravenous contrast", isCorrect: false, explanation: "CT is unnecessary, exposes the toddler to excessive radiation, and delays the definitive airway retrieval procedure (bronchoscopy)." },
            { text: "Prescribe a trial of inhaled salbutamol via spacer and follow up in 2 days", isCorrect: false, explanation: "Inhaled bronchodilators will not resolve a mechanical foreign body obstruction and delay in removal can lead to atelectasis, secondary post-obstructive pneumonia, or airway rupture." },
            { text: "Perform chest physiotherapy and postural drainage in the clinic", isCorrect: false, explanation: "Physical manipulation can dislodge the foreign body and push it higher, risking complete upper airway obstruction and death." }
        ]
    },
    {
        id: 67,
        category: "Nephrology & Internal Medicine",
        vars: {
            age: () => Math.floor(Math.random() * 20) + 50, // 50-69
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} presents with a 1-week history of mild confusion, lethargy, and generalized weakness. Laboratory evaluation reveals a severe hyponatremia with a serum sodium of 122 mmol/L (Normal 135-145). Further testing shows a serum osmolality of 250 mOsm/kg (low), a urine osmolality of 450 mOsm/kg (inappropriately high), and a urine sodium of 45 mmol/L (high). The patient is clinically euvolemic. What is the most likely diagnosis and first-line treatment?",
        options: [
            { text: "Syndrome of Inappropriate Antidiuretic Hormone (SIADH); Fluid restriction", isCorrect: true, explanation: "The patient has euvolemic hypotonic hyponatremia with high urine osmolality (>100 mOsm) and high urine sodium (>40 mmol/L), which is the diagnostic profile of SIADH. First-line therapy for mild-to-moderate, asymptomatic SIADH is strict **Fluid Restriction** (usually <800-1000 mL/day)." },
            { text: "Primary Polydipsia; Administration of high-volume oral water intake", isCorrect: false, explanation: "Primary polydipsia features excessive water drinking, presenting with hyponatremia, but the urine osmolality would be extremely *low* (<100 mOsm) as the kidneys try to excrete the water load, not high (450 mOsm)." },
            { text: "Dehydration (Hypovolemic Hyponatremia); Intravenous Normal Saline (0.9% NaCl)", isCorrect: false, explanation: "Hypovolemic hyponatremia features clinical signs of dehydration (dry mucus membranes, orthostasis) and low urine sodium (<20 mmol/L) as the kidneys retain sodium, which is not the case here." },
            { text: "SIADH; Rapid infusion of 3% hypertonic saline", isCorrect: false, explanation: "Hypertonic saline is reserved *only* for patients with severe, life-threatening symptoms of hyponatremia (seizures, coma, severe confusion). Correcting sodium too rapidly risks Central Pontine Myelinolysis (Osmotic Demyelination Syndrome)." },
            { text: "Adrenal Insufficiency; Daily high-dose oral Spironolactone", isCorrect: false, explanation: "Adrenal insufficiency causes hyponatremia, but it also presents with hyperkalemia, hypoglycemia, hypotension, and is managed with glucocorticoid/mineralocorticoid replacement. Spironolactone (potassium-sparing diuretic) would worsen hyponatremia." }
        ]
    },
    {
        id: 68,
        category: "Geriatrics & Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 75, // 75-89
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "An {age}-year-old {gender} with mild baseline cognitive impairment is brought to the emergency department due to a sudden onset of extreme confusion, agitation, and visual hallucinations that began 24 hours ago. On examination, the patient's level of consciousness fluctuates widely throughout the interview. A urinalysis is positive for nitrites and leukocyte esterase. What is the most appropriate management strategy?",
        options: [
            { text: "Initiate appropriate antibiotics for the Urinary Tract Infection, optimize the room environment, and avoid physical restraints", isCorrect: true, explanation: "The patient has Delirium (acute onset, fluctuating attention/consciousness, visual hallucinations) triggered by an underlying Urinary Tract Infection (UTI). Management focuses on treating the organic cause (antibiotics), providing supportive environmental modifications (reorientation, family presence, day/night cycles), and strictly *avoiding* physical restraints or sedatives, which worsen delirium outcomes." },
            { text: "Initiate high-dose oral Haloperidol immediately to treat the agitation", isCorrect: false, explanation: "Antipsychotics like Haloperidol should be avoided in delirium unless the patient poses an immediate danger to themselves or staff, as they do not treat the underlying cause and carry risks of QTc prolongation and extrapyramidal symptoms." },
            { text: "Admit the patient to a secure psychiatric unit for long-term dementia care", isCorrect: false, explanation: "Delirium is an acute, reversible medical condition triggered by an organic cause (UTI), not a primary psychiatric or baseline chronic dementia progression requiring long-term care." },
            { text: "Apply 4-point physical restraints to prevent the patient from falling", isCorrect: false, explanation: "Physical restraints are highly dangerous, increase agitation, prolong delirium, and are associated with severe injuries, strangulation, and death in elderly patients." },
            { text: "Increase the patient's home donepezil (Cholinesterase inhibitor) dose", isCorrect: false, explanation: "Donepezil treats chronic Alzheimer's dementia symptoms, but has no role in the acute reversal of toxic-metabolic or infectious delirium." }
        ]
    },
    {
        id: 69,
        category: "Surgery & Emergency",
        vars: {
            age: () => Math.floor(Math.random() * 15) + 65, // 65-79
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} with a history of chronic atrial fibrillation presents with sudden-onset, excruciating, diffuse abdominal pain that began 3 hours ago. The patient has vomited twice. On physical exam, the abdomen is soft and non-distended, with only minimal generalized tenderness, showing a striking discrepancy compared to the patient's severe subjective pain. What is the diagnostic imaging modality of choice?",
        options: [
            { text: "Computed Tomography (CT) Angiography of the abdomen and pelvis", isCorrect: true, explanation: "The presentation is classic for Acute Mesenteric Ischemia (sudden severe pain out of proportion to exam findings, in an elderly patient with atrial fibrillation, a source for arterial embolization). The diagnostic test of choice is a CT Angiography of the abdomen/pelvis, which can rapidly identify occlusions in the mesenteric vessels." },
            { text: "Abdominal Ultrasound", isCorrect: false, explanation: "Ultrasound is severely limited by bowel gas, which is prominent in bowel ischemia, making it highly insensitive for evaluating the mesenteric vasculature." },
            { text: "Upper Gastrointestinal Barium Series", isCorrect: false, explanation: "A barium swallow is useful for structural esophageal or pyloric problems, but is slow, offers no vascular detail, and is completely inappropriate in an acute ischemic emergency." },
            { text: "Echocardiogram", isCorrect: false, explanation: "While a TTE can evaluate for a left atrial thrombus, it cannot diagnose active bowel ischemia, which requires direct vascular imaging of the abdomen." },
            { text: "Diagnostic Colonoscopy", isCorrect: false, explanation: "Colonoscopy is contraindicated in acute mesenteric ischemia as bowel wall insufflation can cause bowel perforation and worsens tissue ischemia." }
        ]
    },
    {
        id: 70,
        category: "Ethics & Legal Medicine",
        vars: {
            age: () => Math.floor(Math.random() * 30) + 20, // 20-49
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is diagnosed with acute perforated appendicitis. The surgeon explains that emergent surgery is vital to prevent fatal peritonitis. The patient is fully alert, oriented, answers all questions logically, and demonstrates a clear understanding of the risks, including the high likelihood of death if untreated. However, due to personal beliefs, the patient refuses to undergo surgery. What is the most appropriate next step?",
        options: [
            { text: "Respect the patient's refusal, ensure capacity is fully assessed and documented, and offer alternative medical supportive care", isCorrect: true, explanation: "A competent adult has the absolute legal and ethical right to refuse any medical treatment, including life-saving interventions (principle of Autonomy). As long as the patient has decision-making capacity (understands the diagnosis, options, consequences of refusal, and can communicate a choice logically), the refusal must be respected. Document this carefully, and do not abandon the patient; continue to offer supportive care (pain management, IV antibiotics)." },
            { text: "Obtain an emergency court order to perform the surgery against the patient's will", isCorrect: false, explanation: "Court orders are reserved for incompetent patients (e.g. unconscious, severe dementia, acute psychosis) without a surrogate, not for alert, competent adults exercising autonomy." },
            { text: "Contact the patient's closest relative to obtain surrogate consent for the surgery", isCorrect: false, explanation: "A surrogate decision-maker is only consulted if the patient lacks capacity. Consulting a relative to override a competent patient's refusal is a severe breach of confidentiality and autonomy." },
            { text: "Administer intravenous sedation and wheel the patient to the operating room immediately", isCorrect: false, explanation: "Performing a major surgical procedure on a competent patient against their explicit refusal constitutes battery and is a criminal offense." },
            { text: "Decline to treat the patient further and discharge them from the emergency department", isCorrect: false, explanation: "Unilaterally discharging a patient with a life-threatening illness because they refuse a specific procedure constitutes medical abandonment. You must continue to offer safe alternatives and palliative support." }
        ]
    },
    {
        id: 71,
        category: "Psychiatry",
        vars: {
            age: () => Math.floor(Math.random() * 12) + 18, // 18-29
            gender: () => Math.random() > 0.5 ? 'male' : 'female'
        },
        text: "A {age}-year-old {gender} is brought to the clinic by family members who report a 1-week history of bizarre behavior. The patient has not slept in 4 days, is talking constantly and rapidly, has spent {possessive} entire savings on buying luxury cars, and claims to have been selected by God for a special mission. On exam, the patient is highly irritable, distractible, and hyperactive. What is the most likely diagnosis and first-line treatment?",
        options: [
            { text: "Bipolar I Disorder (Acute Manic Episode); Mood stabilizer (e.g., Lithium or Valproate) or an atypical antipsychotic", isCorrect: true, explanation: "The patient is presenting with a classic Manic Episode (decreased need for sleep, grandiosity, pressured speech, risky spending, lasting at least 1 week, causing marked impairment). The presence of one manic episode is diagnostic of Bipolar I Disorder. First-line treatments include mood stabilizers (Lithium, Valproate) or atypical antipsychotics (Aripiprazole, Risperidone, Olanzapine)." },
            { text: "Schizophrenia; Daily maintenance Haloperidol", isCorrect: false, explanation: "While manic grandiosity can border on psychosis, the primary presentation is driven by mood/energy alterations (decreased sleep, hyper-talkativeness, spending), and Schizophrenia requires active symptoms for at least 6 months." },
            { text: "Bipolar II Disorder; Immediate initiation of Fluoxetine (SSRI) monotherapy", isCorrect: false, explanation: "Bipolar II requires a hypomanic episode (milder, no severe impairment/hospitalization) and a major depressive episode. Antidepressant monotherapy is strictly *contraindicated* in bipolar patients as it can trigger severe manic switching." },
            { text: "Borderline Personality Disorder; Dialectical Behavior Therapy (DBT)", isCorrect: false, explanation: "Borderline personality disorder features chronic mood instability, interpersonal struggles, and self-harm, not a discrete, acute 1-week episode of classic hyper-active, grandiose mania." },
            { text: "Major Depressive Disorder with psychotic features; Electroconvulsive Therapy (ECT)", isCorrect: false, explanation: "The patient has elevated, euphoric, and hyperactive manic symptoms, not depressive mood and psychomotor retardation." }
        ]
    },
    {
        id: 72,
        category: "Internal Medicine & Hematology",
        vars: {
            age: () => Math.floor(Math.random() * 25) + 30, // 30-54
            gender: () => Math.random() > 0.5 ? 'female' : 'male'
        },
        text: "A {age}-year-old {gender} with a long history of severe, poorly controlled rheumatoid arthritis presents with progressive fatigue. Laboratory studies reveal a microcytic anemia with a hemoglobin of 95 g/L and MCV of 76 fL. Further testing reveals: low serum iron, elevated ferritin, and a low Total Iron Binding Capacity (TIBC). What is the most likely diagnosis?",
        options: [
            { text: "Anemia of Chronic Disease (Anemia of Inflammation)", isCorrect: true, explanation: "The patient has Anemia of Chronic Disease (ACD) secondary to her active Rheumatoid Arthritis. ACD is driven by inflammatory cytokines (such as IL-6) that increase hepcidin production, leading to iron trapping in macrophages. It is characterized by low serum iron, but *elevated* iron stores (high Ferritin) and a *low* TIBC (transferrin level decreases in inflammation)." },
            { text: "Iron Deficiency Anemia (IDA)", isCorrect: false, explanation: "IDA features microcytic anemia, but it is characterized by severely depleted iron stores (low Ferritin < 30) and an *elevated* TIBC as the body attempts to transport more iron, which is the opposite of this patient's lab profile." },
            { text: "Beta-Thalassemia Minor", isCorrect: false, explanation: "Thalassemia minor causes a mild microcytic anemia but presents with completely normal or elevated iron parameters (normal ferritin and TIBC), and is diagnosed via hemoglobin electrophoresis." },
            { text: "Aplastic Anemia", isCorrect: false, explanation: "Aplastic anemia features a normocytic or macrocytic pancytopenia (severe depletion of WBCs, RBCs, and platelets due to bone marrow failure), not an isolated chronic microcytic anemia." },
            { text: "Sideroblastic Anemia", isCorrect: false, explanation: "Sideroblastic anemia is characterized by ringed sideroblasts in the bone marrow, showing *elevated* serum iron and transferrin saturation, not low serum iron." }
        ]
    }
];

// Helper function to pick random element
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Vignette Scrambler Compiler
function compileQuestionTemplate(template, index) {
    const values = {};
    if (template.vars) {
        for (const [key, fn] of Object.entries(template.vars)) {
            values[key] = fn();
        }
    }
    
    // Auto-generate pronouns if gender is defined
    if (values.gender) {
        const isMale = values.gender === 'male' || values.gender === 'boy';
        values.possessive = isMale ? 'his' : 'her';
        values.possessiveCap = isMale ? 'His' : 'Her';
        values.subj = isMale ? 'he' : 'she';
        values.subjCap = isMale ? 'He' : 'She';
        values.obj = isMale ? 'him' : 'her';
    }

    function replacePlaceholders(str) {
        if (typeof str !== 'string') return str;
        let result = str;
        for (const [key, val] of Object.entries(values)) {
            result = result.replaceAll(`{${key}}`, val);
        }
        return result;
    }

    const text = replacePlaceholders(template.text);
    
    // Compile options and shuffle option order
    const options = template.options.map(opt => ({
        text: replacePlaceholders(opt.text),
        isCorrect: opt.isCorrect,
        explanation: replacePlaceholders(opt.explanation)
    })).sort(() => 0.5 - Math.random());

    return {
        id: index + 1,
        category: template.category,
        text: text,
        options: options
    };
}

// Dynamically generate exactly 200 unique compiled questions in the question bank!
const macaqueQuestions = [];
for (let i = 0; i < 200; i++) {
    const template = baseTemplates[i % baseTemplates.length];
    macaqueQuestions.push(compileQuestionTemplate(template, i));
}
