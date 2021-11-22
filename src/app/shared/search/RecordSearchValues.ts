import {Filter} from "../models/Filter";
import {PageParams} from "./PageParams";

export interface RecordSearchValues {
  filter: Filter,
  pageParams?: PageParams | null
}
