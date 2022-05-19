export class HeaderProvider {

  static getElementLabel(element) {
    return 'name';
  }

  static getElementIcon(element) {
    return 'icon';
  }

  static getTypeLabel(element) {
    return 'type';
  }
}

export class PlaceholderProvider {

  static getEmpty(element) {
    return {
      text: 'empty',
      icon: 'empty-icon'
    };
  }

  static getMultiple(element) {
    return {
      text: 'multiple',
      icon: 'multiple-icon'
    };
  }
}