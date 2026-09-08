export interface EmailEnviado {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

export interface EmailEnviadoDetalle extends EmailEnviado {
  html?: string;
  text?: string;
}

export interface EmailEnviadoListaResponse {
  object: string;
  has_more: boolean;
  data: EmailEnviado[];
}
