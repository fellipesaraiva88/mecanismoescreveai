/**
 * Sistema modular de workflows
 *
 * Inspirado em n8n, mas em código TypeScript puro
 * Permite criar workflows complexos de forma simples e rápida
 */

export type WorkflowContext = Record<string, any>;

export interface WorkflowNode<TInput = any, TOutput = any> {
  name: string;
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput> | TOutput;
}

export interface WorkflowCondition<TInput = any> {
  name: string;
  evaluate: (input: TInput, context: WorkflowContext) => Promise<boolean> | boolean;
}

export class Workflow {
  private nodes: Map<string, WorkflowNode> = new Map();
  private context: WorkflowContext = {};

  constructor(private name: string) {}

  /**
   * Adiciona um node ao workflow
   */
  addNode<TInput = any, TOutput = any>(
    node: WorkflowNode<TInput, TOutput>
  ): this {
    this.nodes.set(node.name, node);
    return this;
  }

  /**
   * Executa um node específico
   */
  async executeNode<TOutput = any>(
    nodeName: string,
    input?: any
  ): Promise<TOutput> {
    const node = this.nodes.get(nodeName);
    if (!node) {
      throw new Error(`Node '${nodeName}' não encontrado no workflow '${this.name}'`);
    }

    const result = await node.execute(input, this.context);

    // Armazena o resultado no contexto para uso posterior
    this.context[nodeName] = result;

    return result as TOutput;
  }

  /**
   * Executa um workflow completo (sequência de nodes)
   */
  async execute(input: any, nodeSequence: string[]): Promise<any> {
    let currentInput = input;

    for (const nodeName of nodeSequence) {
      currentInput = await this.executeNode(nodeName, currentInput);
    }

    return currentInput;
  }

  /**
   * Executa com condicionais (if/else logic)
   */
  async executeConditional(
    input: any,
    condition: WorkflowCondition,
    trueNodes: string[],
    falseNodes: string[]
  ): Promise<any> {
    const shouldExecuteTrueBranch = await condition.evaluate(input, this.context);

    const nodesToExecute = shouldExecuteTrueBranch ? trueNodes : falseNodes;
    return this.execute(input, nodesToExecute);
  }

  /**
   * Acessa o contexto do workflow
   */
  getContext(): WorkflowContext {
    return this.context;
  }

  /**
   * Define valores no contexto
   */
  setContext(key: string, value: any): this {
    this.context[key] = value;
    return this;
  }

  /**
   * Limpa o contexto
   */
  clearContext(): this {
    this.context = {};
    return this;
  }
}

/**
 * Helper para criar nodes de forma simples
 */
export function createNode<TInput = any, TOutput = any>(
  name: string,
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput> | TOutput
): WorkflowNode<TInput, TOutput> {
  return { name, execute };
}

/**
 * Helper para criar condições
 */
export function createCondition<TInput = any>(
  name: string,
  evaluate: (input: TInput, context: WorkflowContext) => Promise<boolean> | boolean
): WorkflowCondition<TInput> {
  return { name, evaluate };
}
