if (!customElements.get('csv-order-upload')) {
  customElements.define(
    'csv-order-upload',
    class CsvOrderUpload extends HTMLElement {
      constructor() {
        super();
        this.fileInput = this.querySelector('input[type="file"]');
        this.resultsContainer = this.querySelector('[data-csv-order-results]');
        this.statusEl = this.querySelector('[data-csv-order-status]');
        this.addAllButton = this.querySelector('[data-csv-order-add-all]');
        this.results = [];

        this.fileInput.addEventListener('change', this.onFileSelected.bind(this));
        this.addAllButton.addEventListener('click', this.onAddAll.bind(this));
      }

      setStatus(text) {
        this.statusEl.textContent = text;
      }

      async onFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.setStatus(window.csvOrderStrings.uploading);
        this.addAllButton.setAttribute('hidden', 'hidden');
        this.resultsContainer.innerHTML = '';

        const text = await file.text();

        try {
          const response = await fetch(this.dataset.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: text,
          });

          if (!response.ok) {
            this.setStatus(window.csvOrderStrings.error);
            return;
          }

          const data = await response.json();
          this.results = data.results || [];
          this.renderResults();
        } catch (error) {
          this.setStatus(window.csvOrderStrings.error);
        }
      }

      renderResults() {
        if (this.results.length === 0) {
          this.setStatus(window.csvOrderStrings.error);
          return;
        }

        const validCount = this.results.filter((r) => r.found && !r.exceedsStock).length;
        this.setStatus(
          window.csvOrderStrings.summary
            .replace('[count]', this.results.length)
            .replace('[valid]', validCount)
        );

        const table = document.createElement('table');
        table.className = 'quick-order-list__table csv-order-results__table';

        const thead = document.createElement('thead');
        thead.innerHTML = `<tr>
          <th class="caption-with-letter-spacing">${window.csvOrderStrings.sku}</th>
          <th class="caption-with-letter-spacing">${window.csvOrderStrings.product}</th>
          <th class="caption-with-letter-spacing right">${window.csvOrderStrings.quantity}</th>
          <th class="caption-with-letter-spacing">${window.csvOrderStrings.note}</th>
        </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        this.results.forEach((row) => {
          const tr = document.createElement('tr');

          let note = '';
          if (!row.found) {
            note = window.csvOrderStrings.notFound;
            tr.classList.add('csv-order-results__row--error');
          } else if (row.exceedsStock) {
            note = window.csvOrderStrings.exceedsStock.replace('[available]', row.availableQuantity);
            tr.classList.add('csv-order-results__row--error');
          } else if (row.notPackMultiple) {
            note = window.csvOrderStrings.packWarning;
            tr.classList.add('csv-order-results__row--warning');
          }

          tr.innerHTML = `
            <td>${row.sku}</td>
            <td>${row.found ? row.title : '—'}</td>
            <td class="right">${row.quantity}</td>
            <td>${note}</td>
          `;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        this.resultsContainer.innerHTML = '';
        this.resultsContainer.appendChild(table);

        if (validCount > 0) {
          this.addAllButton.removeAttribute('hidden');
        }
      }

      async onAddAll() {
        const items = this.results
          .filter((row) => row.found && !row.exceedsStock)
          .map((row) => ({ id: parseInt(row.variantId, 10), quantity: row.quantity }));

        if (items.length === 0) return;

        this.addAllButton.disabled = true;
        this.setStatus(window.csvOrderStrings.adding);

        try {
          const response = await fetch(window.routes.cart_add_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ items }),
          });

          if (!response.ok) {
            const error = await response.json();
            this.setStatus(error.description || window.csvOrderStrings.error);
            this.addAllButton.disabled = false;
            return;
          }

          this.setStatus(window.csvOrderStrings.added);
          window.location.href = window.routes.cart_url || '/cart';
        } catch (error) {
          this.setStatus(window.csvOrderStrings.error);
          this.addAllButton.disabled = false;
        }
      }
    }
  );
}
