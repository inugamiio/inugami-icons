import { Component, computed, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InugamiIconsUtils } from './inugami-icons-utils';

@Component({
  selector: 'inu-icon',
  imports: [],
  template: `
    <span [class]="containerClass()" [style]="containerSize()">
      @if (hasContent()) {
        <span class="inu-icon-content" [innerHTML]="_content()" ></span>
      }
    </span>
  `,
  styleUrls: ['./inugami-icons.scss'],
})
export class InuIcon {
  //====================================================================================================================
  // ATTRIBUTES
  //====================================================================================================================
  private sanitizer = inject(DomSanitizer);

  icon = input<string | null>(null);
  defaultIcon = input<string | null>(null);
  styleclass = input<string | null>(null);
  size = input<number | null>(1);

  
  protected containerSize: WritableSignal<string> = signal<string>('');
  protected hasContent: WritableSignal<boolean> = signal<boolean>(false);
  protected _content: WritableSignal<SafeHtml | null> = signal<SafeHtml | null>(null);
  //====================================================================================================================
  // INIT
  //====================================================================================================================
  constructor() {
    effect(() => {
      const name = this.icon();
      let content = InugamiIconsUtils.getIcon(name);
      const defaultIcon = this.defaultIcon();
      if(!content && defaultIcon){
        content = InugamiIconsUtils.getIcon(defaultIcon);
      }

      const iconContent = content ? this.sanitizer.bypassSecurityTrustHtml(content) : null;
      this.hasContent.set(iconContent != undefined && iconContent != null);
      this._content.set(iconContent);

      let currentSize = this.size();
      if(!currentSize||currentSize<=0){
        currentSize =1;
      }
      this.containerSize.set(`height: ${currentSize}rem; width: ${currentSize}rem;`);
      
    });
  }

  //====================================================================================================================
  // GETTERS
  //====================================================================================================================
  containerClass = computed(() => {
    const result = ['inu-icon'];
    const extra = this.styleclass();
    if (extra) {
      result.push(extra);
    }
    return result.join(' ');
  });
}
