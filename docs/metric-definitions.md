# Mathematical Definitions of Evaluation Metrics

## 1. Continuous Angle Agreement Metrics

### 1.1 Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N}\sum_{i=1}^{N} |y_i - \hat{y}_i|$$
Where:
- $y_i$ is the independent reference measurement in degrees.
- $\hat{y}_i$ is the automated algorithm estimate in degrees.
- $N$ is the number of valid paired observations.

### 1.2 Signed Mean Bias
$$\bar{d} = \frac{1}{N}\sum_{i=1}^{N} (\hat{y}_i - y_i)$$
Measures systematic directional over- or under-estimation.

### 1.3 Bland–Altman Limits of Agreement (95% LoA)
$$\text{LoA}_{\text{upper}} = \bar{d} + 1.96 \cdot s_d$$
$$\text{LoA}_{\text{lower}} = \bar{d} - 1.96 \cdot s_d$$
Where $s_d$ is the sample standard deviation of the paired differences:
$$s_d = \sqrt{\frac{1}{N-1}\sum_{i=1}^{N} (d_i - \bar{d})^2}$$

---

## 2. Discrete Ordinal Agreement Metrics

### 2.1 Exact Category Agreement
$$P_o = \frac{\sum_{i=1}^{k} n_{ii}}{N}$$
Proportion of cases where automated RULA score exactly matches reference score.

### 2.2 Linearly Weighted Cohen's Kappa ($\kappa_w$)
$$\kappa_w = 1 - \frac{\sum_{i=1}^{k}\sum_{j=1}^{k} w_{ij} O_{ij}}{\sum_{i=1}^{k}\sum_{j=1}^{k} w_{ij} E_{ij}}$$
Where:
- $O_{ij}$ is the observed confusion matrix count.
- $E_{ij} = \frac{R_i \cdot C_j}{N}$ is the chance expected count.
- $w_{ij} = \frac{|i - j|}{k - 1}$ is the linear disagreement penalty weight.

### 2.3 Interpretation Scale (Landis & Koch, 1977)
- $< 0.20$: Slight agreement
- $0.21\text{–}0.40$: Fair agreement
- $0.41\text{–}0.60$: Moderate agreement
- $0.61\text{–}0.80$: Substantial agreement
- $0.81\text{–}1.00$: Almost perfect agreement
