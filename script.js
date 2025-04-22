// Variáveis globais
let model;
let imageElement = document.getElementById('image-preview');
let imagePreviewContainer = document.getElementById('image-preview-container');
let uploadArea = document.getElementById('upload-area');
let predictButton = document.getElementById('predict-button');
let resultsContainer = document.getElementById('results');
let predictionResults = document.getElementById('prediction-results');
let confidenceBars = document.getElementById('confidence-bars');
let loadingElement = document.getElementById('loading');

// Mostrar tela de carregamento
loadingElement.style.display = 'flex';

// Carregar o modelo
async function loadModel() {
    const modelURL = 'model.json';
    const metadataURL = 'metadata.json';
    
    try {
        model = await tmImage.load(modelURL, metadataURL);
        console.log('Modelo carregado com sucesso!');
        
        // Esconder tela de carregamento
        loadingElement.style.display = 'none';
        
        // Configurar eventos
        setupEventListeners();
    } catch (error) {
        console.error('Erro ao carregar o modelo:', error);
        loadingElement.innerHTML = '<p>Erro ao carregar o modelo. Por favor, recarregue a página.</p>';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Upload de arquivo
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    
    // Arrastar e soltar
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleImageUpload({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // Botão de previsão
    predictButton.addEventListener('click', predictImage);
}

// Manipular upload de imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imageElement.src = e.target.result;
        imagePreviewContainer.style.display = 'block';
        predictButton.disabled = false;
        resultsContainer.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Fazer previsão na imagem
async function predictImage() {
    if (!imageElement.src || imageElement.src === '#') {
        alert('Por favor, selecione uma imagem primeiro.');
        return;
    }
    
    predictButton.disabled = true;
    predictButton.textContent = 'Processando...';
    
    try {
        const prediction = await model.predict(imageElement);
        displayResults(prediction);
    } catch (error) {
        console.error('Erro ao fazer previsão:', error);
        alert('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
        predictButton.disabled = false;
        predictButton.textContent = 'Classificar Imagem';
    }
}

// Exibir resultados
function displayResults(predictions) {
    // Ordenar previsões por confiança (maior primeiro)
    predictions.sort((a, b) => b.probability - a.probability);
    
    // Limpar resultados anteriores
    predictionResults.innerHTML = '';
    confidenceBars.innerHTML = '';
    
    // Exibir cada previsão
    predictions.forEach(pred => {
        // Adicionar item de previsão
        const predElement = document.createElement('div');
        predElement.className = 'prediction-item';
        predElement.innerHTML = `
            <strong>${pred.className}:</strong> ${(pred.probability * 100).toFixed(2)}%
        `;
        predictionResults.appendChild(predElement);
        
        // Adicionar barra de confiança
        const barContainer = document.createElement('div');
        barContainer.className = 'confidence-bar-container';
        
        const barLabel = document.createElement('div');
        barLabel.textContent = pred.className;
        barLabel.style.marginBottom = '5px';
        barLabel.style.fontWeight = 'bold';
        
        const barElement = document.createElement('div');
        barElement.className = 'confidence-bar';
        
        const barLevel = document.createElement('div');
        barLevel.className = 'confidence-level';
        barLevel.style.width = `${pred.probability * 100}%`;
        barLevel.textContent = `${(pred.probability * 100).toFixed(1)}%`;
        
        barElement.appendChild(barLevel);
        barContainer.appendChild(barLabel);
        barContainer.appendChild(barElement);
        confidenceBars.appendChild(barContainer);
    });
    
    // Mostrar container de resultados
    resultsContainer.style.display = 'block';
}

// Iniciar aplicação carregando o modelo
loadModel();